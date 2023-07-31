const compareArrays = (array1, array2) => {
  if (array1.length !== array2.length) return false;
  const neww = (object) =>
    JSON.stringify(
      Object.keys(object)
        .sort()
        .map((key) => [key, object[key]])
    );
  array1 = new Set(array1.map(neww));
  return array2.every((object) => array1.has(neww(object)));
};
module.exports.compareArrays = compareArrays

const filterArray = (array, property) => {
  return array
    .filter((item) => item.name == property)
    .map((s) => {
      return s.value;
    });
};
module.exports.filterArray = filterArray

const removeDuplicates = (array) => {
  return [...new Set(array)];
};
module.exports.removeDuplicates = removeDuplicates

const randomize = (array) => {
  return [...array].sort(() => 0.5 - Math.random());
};
module.exports.randomize = randomize
