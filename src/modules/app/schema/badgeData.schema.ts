import { FromSchema } from 'json-schema-to-ts';
import { asJsonSchema } from '../../../common/typings';

export type BadgeData = FromSchema<typeof BadgeDataSchema>;
export const BadgeDataSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: [
    'schemaVersion',
    'namedLogo',
    'label',
    'message',
    'style',
    'color',
  ],
  properties: {
    schemaVersion: { type: 'number' },
    namedLogo: { type: 'string' },
    label: { type: 'string' },
    message: { type: 'string' },
    style: { type: 'string' },
    color: { type: 'string' },
  },
});
