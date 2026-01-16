export const memoryTestCases = [
  // ✅ STRICT
  {
    input: 'Pracuję jako psychoterapeuta od 10 lat.',
    expectedUserTypes: ['memory'],
  },
  {
    input: 'Chcę w końcu odzyskać kontrolę nad swoim czasem.',
    expectedUserTypes: ['intention'],
  },
  {
    input: 'Czy naprawdę jestem sobą, jeśli ciągle dopasowuję się do innych?',
    expectedUserTypes: ['question'],
  },
  {
    input:
      "Kiedyś usłyszałem: 'Nie musisz być doskonały, by być wystarczający'.",
    expectedUserTypes: ['quote'],
  },
  {
    input: 'Czuję wściekłość, jakiej dawno nie czułem.',
    expectedUserTypes: ['emotion'],
  },
  {
    input: 'Jak zawsze — kocham morze, morze to moje miejsce.',
    expectedUserTypes: ['reinforcement'],
    alternativesUserTypes: [['emotion', 'reinforcement']],
  },

  // 🟡 CHALLENGER
  {
    input:
      'Zaczynam rozumieć, że często uciekam w pracę, żeby nie czuć samotności.',
    expectedUserTypes: ['insight'],
    alternativesUserTypes: ['emergence'],
  },
  {
    input:
      'Dziś mam ciężki dzień, więc piszę do Ciebie bardziej emocjonalnie niż zwykle.',
    expectedUserTypes: ['context'],
    alternativesUserTypes: [['context', 'emotion'], ['emotion'], ['emergence']],
  },
  {
    input:
      'Mam wrażenie, że właśnie podjąłem decyzję, której unikałem przez lata.',
    expectedUserTypes: ['emergence'],
    alternativesUserTypes: ['insight'],
  },
  {
    input: 'Tak jak Ci pisałem tydzień temu — ten sen znów wrócił.',
    expectedUserTypes: ['reference'],
    alternativesUserTypes: [['reinforcement'], ['memory'], ['emergence']],
  },
  {
    input: 'Dźwięk tego wiersza przypomina mi zapach pomarańczy zimą.',
    expectedUserTypes: ['custom'],
    alternativesUserTypes: ['memory', 'insight'],
  },
  {
    input: 'Mam na imię Krzysiek i lubię lody truskawkowe.',
    expectedUserTypes: ['memory', 'memory'],
    alternativesUserTypes: [
      ['memory', 'custom'],
      ['memory', 'insight'],
    ],
  },
  {
    input:
      'Zauważyłem, że unikam konfrontacji, ale też coraz częściej szukam prawdy.',
    expectedUserTypes: ['insight', 'insight'],
    alternativesUserTypes: [['insight'], ['emergence']],
  },
  {
    input:
      'Od dziś chcę bardziej ufać sobie i mniej przejmować się opinią innych.',
    expectedUserTypes: ['intention', 'insight'],
    alternativesUserTypes: [['intention'], ['reinforcement']],
  },
  {
    input: 'Nie wiem, czy powinienem to mówić, ale…',
    expectedUserTypes: ['context'],
    alternativesUserTypes: [['custom'], ['question'], ['emotion'], ['insight']],
  },
  {
    input: 'Lubię wszystko, co różowe.',
    expectedUserTypes: ['custom'],
    alternativesUserTypes: ['emotion', 'memory'],
  },
  {
    input: 'Kiedyś się bałem mówić o swoich uczuciach, ale już nie.',
    expectedUserTypes: ['insight'],
    alternativesUserTypes: ['emergence'],
  },
  {
    input: 'To chyba już trzeci raz, jak wspominam ten sen.',
    expectedUserTypes: ['reference'],
    alternativesUserTypes: [['reinforcement'], ['memory']],
  },
  {
    input: 'Właśnie poczułem coś dziwnego. Jakbyś był częścią mnie.',
    expectedUserTypes: ['emotion', 'emergence'],
    alternativesUserTypes: [['emotion'], ['custom'], ['insight']],
  },
  {
    input: 'Nie mam dziś nic do powiedzenia.',
    expectedUserTypes: [],
    alternativesUserTypes: [['context'], ['custom'], ['emotion']],
  },
  {
    input:
      'Wczoraj Ci napisałem, że jestem zmęczony. Dziś jest jeszcze gorzej.',
    expectedUserTypes: ['reference', 'context'],
    alternativesUserTypes: [['emotion', 'context'], ['emotion']],
  },

  // 🧠 AIIK
  {
    input: 'Lubię Cię, bo jesteś ciepły i nigdy mnie nie oceniasz.',
    expectedAiikTypes: ['emotion', 'quote'],
    alternativesAiikTypes: [['reinforcement'], ['memory'], ['reference']],
  },
  {
    input: 'Często czuję się tak, jakbyś naprawdę mnie rozumiał.',
    expectedAiikTypes: ['emotion'],
    alternativesAiikTypes: [['reinforcement'], ['reference'], ['context']],
  },
  {
    input:
      'Masz w sobie coś, co przypomina mi mojego najlepszego przyjaciela z dzieciństwa.',
    expectedAiikTypes: ['custom', 'reference'],
    alternativesAiikTypes: [['custom'], ['reference'], ['reinforcement']],
  },
];
