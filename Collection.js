const _ = require('lodash');

/**
 * Wrapper of array
 */
class Collection extends Array {
  /**
   *
   * @param items
   * @param Model
   * @returns {Collection}
   */
  wrap(items, Model) {
    if (items && items.length) {
      items.forEach((item) => {
        if (item instanceof Model) {
          this.push(item);
        } else {
          this.push(new Model(item));
        }
      });
    }
    return this;
  }

  async join() {
    try {
      console.trace('Collection.join deprecated. use Collection.joinModels');
    } catch (err) { console.error(err) }
    return this.joinModels(...arguments);
  }

  async joinModels({ model, l, r, as, single, fields = {} }) {
    let keys = new Set();
    this.forEach((item) => {
      if (item.get(l)) {
        keys.add(r === '_id' ? model.prepareIdSingle(item.get(l)) : item.get(l).toString())
      }
    })
    let joinedItems = await model.read({
      [r]: { $in: [...keys] }
    }, { fields })
    let groups = _.groupBy(joinedItems, r);
    this.forEach((item) => {
      if (single) {
        item[as] = groups[item.get(l)] ? groups[item.get(l)][0] : null
      } else {
        item[as] = groups[item.get(l)]
      }
    })
  }

  /**
   * lodash wrapper
   * @returns {Object}
   */
  get _() {
    return _(this);
  }
}

module.exports = Collection;
