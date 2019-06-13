import { uniqBy } from 'lodash';
import { BlockTask } from './block-task';

export class TaskCollection {
    constructor(private tasks: BlockTask[] = []) {}

    public get first(): BlockTask {
        return this.tasks[0];
    }

    public get last(): BlockTask {
        return this.tasks[this.tasks.length - 1];
    }

    public get length(): number {
        return this.tasks.length;
    }

    public add(task: BlockTask) {
        this.tasks.push(task);
    }

    public getData(key: keyof BlockTask, uniqKey?: string): any[] {
        const data = this.tasks
            .map(task => task.get(key))
            .reduce((result: any[], items) => result.concat(items), [])
            .filter(item => !!item)
            .map(item => item.toJSON(true));
        return uniqKey ? uniqBy(data, uniqKey) : data;
    }
}
