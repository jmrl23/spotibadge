import KeyvRedis from '@keyv/redis';
import { createCache } from 'cache-manager';
import { FastifyRequest } from 'fastify';
import Keyv from 'keyv';
import { prisma } from '../../common/prisma';
import { asRoute } from '../../common/typings';
import { REDIS_URL } from '../../config/env';
import { AppService } from './app.service';
import { BadgeDataSchema } from './schema/badgeData.schema';
import { BadgeParam, BadgeParamSchema } from './schema/badgeParam.schema';
import {
  CallbackSchema,
  Callback as CallbackSchemaType,
} from './schema/callback.schema';
import ms from 'ms';

declare module 'fastify' {
  interface FastifyInstance {
    appService: AppService;
  }
}

export const prefix = '/';

export default asRoute(async function appRoute(app) {
  const appService = new AppService(
    prisma,
    createCache({
      ttl: ms('5m'),
      stores: [
        new Keyv({
          namespace: 'spotibadge',
          store: new KeyvRedis(REDIS_URL),
        }),
      ],
    }),
  );

  app.decorate('appService', appService);

  app

    .route({
      method: 'GET',
      url: '/login',
      schema: {
        description: 'Login and grant access to Spotify',
        tags: ['app'],
        response: {
          200: CallbackSchema,
        },
      },
      async handler(_, response) {
        response.redirect(this.appService.getAuthUrl());
      },
    })

    .route({
      method: 'GET',
      url: '/callback',
      schema: {
        description: 'Callback from Spotify',
        tags: ['app'],
        querystring: CallbackSchema,
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['data'],
            properties: {
              data: {
                type: 'object',
                additionalProperties: false,
                required: ['code'],
                properties: {
                  code: {
                    type: 'string',
                    description: 'The code',
                  },
                },
              },
            },
          },
        },
      },
      async handler(
        request: FastifyRequest<{
          Querystring: CallbackSchemaType;
        }>,
      ) {
        const { code } = await this.appService.createReference(
          request.query.code,
        );
        return {
          data: { code },
        };
      },
    })

    .route({
      method: 'GET',
      url: '/:code/badge-data',
      schema: {
        description: 'Get badge data',
        tags: ['app'],
        params: BadgeParamSchema,
        response: {
          200: BadgeDataSchema,
        },
      },
      async handler(
        request: FastifyRequest<{
          Params: BadgeParam;
        }>,
      ) {
        const badgeData = await this.appService.generateBadgeData(
          request.params.code,
        );
        return badgeData;
      },
    });
});
