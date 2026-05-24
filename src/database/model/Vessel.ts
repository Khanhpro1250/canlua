import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Vessel extends Model {
  static table = 'vessels';

  @field('name') name!: string;
  @field('phone') phone?: string;
  @field('weight') weight!: number;
  @field('count') count!: number;
  @field('date_str') dateStr!: string;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
