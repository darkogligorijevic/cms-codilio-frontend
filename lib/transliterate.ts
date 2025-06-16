export const transliterate = (text: string): string => {
  const map: Record<string, string> = {
    А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D',
    Ђ: 'Dj', Е: 'E', Ж: 'Z', З: 'Z', И: 'I',
    Ј: 'J', К: 'K', Л: 'L', Љ: 'Lj', М: 'M',
    Н: 'N', Њ: 'Nj', О: 'O', П: 'P', Р: 'R',
    С: 'S', Т: 'T', Ћ: 'C', У: 'U', Ф: 'F',
    Х: 'H', Ц: 'C', Ч: 'C', Џ: 'Dz', Ш: 'S',
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd',
    ђ: 'dj', е: 'e', ж: 'z', з: 'z', и: 'i',
    ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm',
    н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', ћ: 'c', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'c', џ: 'dz', ш: 's'
  };

  return text
    .split('')
    .map(char => map[char] ?? char)
    .join('');
};
