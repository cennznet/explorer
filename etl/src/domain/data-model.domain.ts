import { classToPlain } from 'class-transformer';
import { snakeCase } from 'lodash';

export abstract class DataModel {
    public toJSON(useSnakeCase = false): object {
        const obj = classToPlain(this);
        return useSnakeCase
            ? Object.keys(obj).reduce((o, key) => {
                  o[snakeCase(key)] = obj[key];
                  return o;
              }, {})
            : obj;
    }
}
