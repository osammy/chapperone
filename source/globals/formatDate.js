const months = [
  'Jan',
  'Feb',
  'March',
  'April',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function getDayFormat(day) {
  switch (day) {
    case 1:
      var format = 'st';
      break;
    case 2:
      var format = 'nd';
      break;
    case 3:
      var format = 'rd';
      break;
    default:
      var format = 'th';
  }
  return format;
}

export const formatDate = date => {
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }

  let formattedDate;

  var day = date.getDate();
  var month = date.getMonth(); //Be careful! January is 0 not 1
  var year = date.getFullYear();

  const monthInString = months[month];

  const dDayFormat = getDayFormat(day);

  formattedDate = `${day}${dDayFormat}, ${monthInString} ${year}`;

  return formattedDate;
};
export const formatTime = date => {
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }
  let hrs = date.getHours();
  let mins = date.getMinutes(); //Be careful! January is 0 not 1

  if (hrs < 9) {
    hrs = `0${hrs}`;
  }
  if (mins < 9) {
    mins = `0${mins}`;
  }

  return `${hrs} : ${mins}`;
};

export default formatDate;
