import { FromSchema } from 'json-schema-to-ts';
import { asJsonSchema } from '../../../common/typings';

export type BadgeParam = FromSchema<typeof BadgeParamSchema>;
export const BadgeParamSchema = asJsonSchema({
  type: 'object',
  required: ['code'],
  additionalProperties: false,
  properties: {
    code: {
      type: 'string',
      minLength: 6,
      maxLength: 6,
    },
  },
});
