import { FromSchema } from 'json-schema-to-ts';
import { asJsonSchema } from '../../../common/typings';

export type Callback = FromSchema<typeof CallbackSchema>;
export const CallbackSchema = asJsonSchema({
  type: 'object',
  required: ['code'],
  additionalProperties: false,
  properties: {
    code: {
      type: 'string',
    },
  },
});
