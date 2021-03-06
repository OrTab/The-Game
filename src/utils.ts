export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomColor = (): string => {
  return "#" + Math.random().toString(16).substr(-6);
};

export const createImage = (
  imgSrc: string,
  onLoadFunc?: () => void
): HTMLImageElement => {
  const src = imgSrc.replace("build", "build/");
  const img = new Image();
  img.src = src;
  if (onLoadFunc) img.onload = onLoadFunc;
  return img;
};

export const formatNumber = (number: number | string, sepNum: number = 3,seperator:string=',') => {
  number = number.toString();
  let formatedNumber = "";
  let counter = number.length - 1;

  for (let i = 0; i < number.length; i++) {
    formatedNumber += number[i];
    if (counter % sepNum === 0 && counter !== 0) {
      formatedNumber += seperator;
    }
    counter--;
  }
 return formatedNumber
};
