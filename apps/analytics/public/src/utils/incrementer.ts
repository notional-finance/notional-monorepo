export default function incrementer(string: any) {
  // args to string
  const str = string.toString();

  // extract string's number
  let number = str.match(/\d+/) === null ? 0 : str.match(/\d+/)[0];

  // store number's length
  const numberLength = number.length;

  // increment number by 1
  number = (parseInt(number) + 1).toString();

  // if there were leading 0s, add them again
  while (number.length < numberLength) {
    number = '0' + number;
  }

  return str.replace(/[0-9]/g, '').concat(number);
}
