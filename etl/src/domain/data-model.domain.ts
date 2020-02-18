import { classToPlain, plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { camelCase, snakeCase } from 'lodash';

function toCamelCase(obj: any): any {
    return Object.keys(obj).reduce((o, key) => {
        o[camelCase(key)] = obj[key];
        return o;
    }, {});
}

export abstract class DataModel {
    public static build<T, V>(cls: ClassType<T>, obj: V[]): T[];
    public static build<T, V>(cls: ClassType<T>, obj: V): T;
    public static build<T, V>(cls: ClassType<T>, obj: V | V[]): T | T[] {
        const converted: V = Array.isArray(obj) ? obj.map(o => toCamelCase(o)) : toCamelCase(obj);
        return plainToClass(cls, converted);
    }

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
