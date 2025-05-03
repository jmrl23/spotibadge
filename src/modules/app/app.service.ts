import { Cache } from 'cache-manager';
import { Unauthorized } from 'http-errors';
import qs from 'node:querystring';
import { CurrentlyPlaying } from 'spotify-types';
import { Prisma } from '../../../generated/prisma';
import { PrismaClient } from '../../../generated/prisma/client';
import { generate } from '../../common/random-string';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '../../config/env';
import scope from './config/scope.json';
import { BadgeData } from './schema/badgeData.schema';
import { accounts, api } from './util/axios';
import ms from 'ms';

type Reference = Prisma.ReferenceGetPayload<{
  select: {
    id: true;
    createdAt: true;
    updatedAt: true;
    code: true;
    accessToken: true;
    refreshToken: true;
  };
}>;

export class AppService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cache: Cache,
  ) {}

  public getAuthUrl(): string {
    return `https://accounts.spotify.com/authorize?${qs.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scope.join(' '),
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: generate(),
    })}`;
  }

  public async createReference(callbackCode: string): Promise<Reference> {
    const code = generate(6);
    const existingReference = await this.prisma.reference.findUnique({
      where: { code },
      select: { id: true },
    });
    if (existingReference) return await this.createReference(callbackCode);

    const response = await accounts.post<{
      access_token?: string;
      refresh_token?: string;
    }>(
      '/api/token',
      qs.stringify({
        code: callbackCode,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    );

    const { access_token: accessToken, refresh_token: refreshToken } =
      response.data;
    if (!accessToken || !refreshToken)
      throw new Unauthorized('Failed to generate tokens');

    const reference = await this.prisma.reference.create({
      data: {
        code,
        accessToken,
        refreshToken,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        code: true,
        accessToken: true,
        refreshToken: true,
      },
    });
    return reference;
  }

  public async generateBadgeData(code: string): Promise<BadgeData> {
    const player = await this.getPlayerState(code);
    if (player === null) {
      return {
        schemaVersion: 1,
        namedLogo: 'spotify',
        label: 'Not Playing',
        message: 'Offline',
        color: 'cccccc',
        style: 'for-the-badge',
      };
    }

    const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
    const color = colors[Math.round(Math.random() * (colors.length - 1))];

    let message: string = '-';

    if (player.item) {
      if ('artists' in player.item) {
        const song = player.item.name;
        const artist = player.item.artists.at(0)?.name;
        message = song;
        if (artist) message += ` • ${artist}`;
      } else {
        const show = player.item.show;
        const { name, publisher } = show;
        message = `${name} • ${publisher}`;
      }
    }

    const badgeData: BadgeData = {
      schemaVersion: 1,
      namedLogo: 'spotify',
      label: player.is_playing ? 'Playing' : 'Paused',
      message,
      color,
      style: 'for-the-badge',
    };

    return badgeData;
  }

  private async getReferenceByCode(code: string): Promise<Reference | null> {
    const cachedReference = await this.cache.get<Reference>(
      `reference:${code}`,
    );
    if (cachedReference) return cachedReference;
    const reference = await this.prisma.reference.findUnique({
      where: { code },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        code: true,
        accessToken: true,
        refreshToken: true,
      },
    });
    if (!reference) return null;

    const response = await accounts.post<{ access_token?: string }>(
      '/api/token',
      qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: reference.refreshToken,
      }),
    );
    const { refreshToken } = await this.prisma.reference.update({
      where: { id: reference.id },
      data: {
        accessToken: response.data.access_token,
      },
    });

    reference.refreshToken = refreshToken;

    if (reference)
      await this.cache.set(`reference:${code}`, reference, ms('59m'));
    return reference;
  }

  private async getPlayerState(code: string): Promise<CurrentlyPlaying | null> {
    const reference = await this.getReferenceByCode(code);
    if (!reference) throw new Unauthorized('Invalid code');
    const response = await api.get<CurrentlyPlaying>('/v1/me/player', {
      headers: {
        Authorization: `Bearer ${reference.accessToken}`,
      },
    });

    if (
      !response.data ||
      !response.headers ||
      typeof response.headers.get !== 'function'
    ) {
      return null;
    }

    return response.data;
  }
}
