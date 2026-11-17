import { FieldType, PhrasalVerb } from '../types';

export const PHRASAL_VERBS: PhrasalVerb[] = [
  {
    id: 'pv-find-out',
    verb: 'find out',
    meaningUz: 'Aniqlamoq, bilib olmoq',
    formalAlternative: 'determine / discover',
    examples: [
      'We need to find out the delivery date.',
      'Please find out who approved the shipment.',
    ],
    field: 'logistics',
    frequency: 'high',
    quiz: {
      questionUz: '"Find out" ning rasmiy muqobili qaysi?',
      options: ['determine', 'look up', 'give up', 'put off'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-carry-out',
    verb: 'carry out',
    meaningUz: 'Bajarimoq, amalga oshirmoq',
    formalAlternative: 'execute / implement',
    examples: [
      'The team will carry out the inspection tomorrow.',
      'We carried out a full risk assessment.',
    ],
    field: 'engineering',
    frequency: 'high',
    quiz: {
      questionUz: '"Carry out a plan" nimani anglatadi?',
      options: ['Rejani amalga oshirish', 'Rejani bekor qilish', 'Rejani yozish', 'Rejani kutish'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-set-up',
    verb: 'set up',
    meaningUz: 'O‘rnatmoq, tashkil etmoq',
    formalAlternative: 'establish / configure',
    examples: [
      'IT will set up the new server tonight.',
      'We set up a meeting with the client.',
    ],
    field: 'it',
    frequency: 'high',
    quiz: {
      questionUz: 'Tizimni sozlash uchun rasmiyroq so‘z?',
      options: ['configure', 'set off', 'turn down', 'break up'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-look-into',
    verb: 'look into',
    meaningUz: 'Tekshirib ko‘rmoq, o‘rganmoq',
    formalAlternative: 'investigate / examine',
    examples: [
      'We will look into the delay immediately.',
      'Could you look into this complaint?',
    ],
    field: 'business',
    frequency: 'high',
    quiz: {
      questionUz: '"Look into" ning rasmiy muqobili?',
      options: ['investigate', 'look after', 'look up', 'look out'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-put-off',
    verb: 'put off',
    meaningUz: 'Kechiktirmoq, keyinga qoldirmoq',
    formalAlternative: 'postpone / defer',
    examples: [
      'We had to put off the shipment by two days.',
      'Do not put off writing the report.',
    ],
    field: 'logistics',
    frequency: 'mid',
    quiz: {
      questionUz: 'Uchrashuvni keyinga qoldirish — rasmiy so‘z?',
      options: ['postpone', 'put on', 'put up', 'put in'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-bring-up',
    verb: 'bring up',
    meaningUz: 'Mavzuni ko‘tarmoq, eslatmoq',
    formalAlternative: 'raise / mention',
    examples: [
      'She brought up the budget issue in the meeting.',
      'I would like to bring up one more point.',
    ],
    field: 'business',
    frequency: 'high',
    quiz: {
      questionUz: 'Majlisda masalani ko‘tarish — rasmiy so‘z?',
      options: ['raise', 'bring down', 'bring out', 'bring in'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-run-out',
    verb: 'run out (of)',
    meaningUz: 'Tugab qolmoq, zaxira tugamoq',
    formalAlternative: 'exhaust / deplete',
    examples: [
      'We ran out of spare parts last week.',
      'The warehouse ran out of packaging materials.',
    ],
    field: 'logistics',
    frequency: 'high',
    quiz: {
      questionUz: '"Run out of stock" nimani anglatadi?',
      options: ['Zaxira tugadi', 'Zaxira oshdi', 'Zaxira yo‘qoladi', 'Zaxira sotildi'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-work-out',
    verb: 'work out',
    meaningUz: 'Hisoblamoq, yechim topmoq',
    formalAlternative: 'calculate / resolve',
    examples: [
      'We need to work out the total cost.',
      'The engineers worked out a safer design.',
    ],
    field: 'engineering',
    frequency: 'mid',
    quiz: {
      questionUz: 'Narxni hisoblash uchun rasmiy so‘z?',
      options: ['calculate', 'work on', 'work up', 'work off'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-log-in',
    verb: 'log in / log on',
    meaningUz: 'Tizimga kirmoq',
    formalAlternative: 'authenticate / access the system',
    examples: [
      'Please log in with your company email.',
      'Users must log on before accessing the database.',
    ],
    field: 'it',
    frequency: 'high',
    quiz: {
      questionUz: 'Tizimga kirishning rasmiy ifodasi?',
      options: ['authenticate', 'log out', 'shut down', 'boot up'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-back-up',
    verb: 'back up',
    meaningUz: 'Nusxa olmoq; qo‘llab-quvvatlamoq',
    formalAlternative: 'create a backup / support',
    examples: [
      'Always back up your code before deploying.',
      'The data was backed up overnight.',
    ],
    field: 'computing',
    frequency: 'high',
    quiz: {
      questionUz: 'Ma’lumotlardan nusxa olish — rasmiy ifoda?',
      options: ['create a backup', 'back down', 'back off', 'back out'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-point-out',
    verb: 'point out',
    meaningUz: 'Ko‘rsatib o‘tmoq, e’tibor qaratmoq',
    formalAlternative: 'highlight / note',
    examples: [
      'The manager pointed out several errors in the draft.',
      'I would like to point out a risk in the schedule.',
    ],
    field: 'business',
    frequency: 'high',
    quiz: {
      questionUz: '"Point out" ning rasmiy muqobili?',
      options: ['highlight', 'point at', 'point to', 'point up'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-follow-up',
    verb: 'follow up',
    meaningUz: 'Davom ettirib tekshirmoq, keyingi qadam',
    formalAlternative: 'pursue / monitor further',
    examples: [
      'I will follow up with the supplier tomorrow.',
      'Please follow up on the pending invoices.',
    ],
    field: 'business',
    frequency: 'high',
    quiz: {
      questionUz: 'Mijoz bilan keyingi aloqa — qaysi fe’l?',
      options: ['follow up', 'follow through only', 'fall behind', 'fall out'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-hand-over',
    verb: 'hand over',
    meaningUz: 'Topshirmoq, o‘tkazmoq',
    formalAlternative: 'transfer / deliver',
    examples: [
      'Please hand over the documents to the warehouse.',
      'The project was handed over to the new team.',
    ],
    field: 'logistics',
    frequency: 'mid',
    quiz: {
      questionUz: 'Hujjatlarni topshirish — rasmiy so‘z?',
      options: ['transfer', 'hand in only', 'hand out', 'hand back only'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-break-down',
    verb: 'break down',
    meaningUz: 'Buzilmoq; tahlil qilib bo‘laklarga ajratmoq',
    formalAlternative: 'malfunction / analyze in detail',
    examples: [
      'The conveyor broke down during the night shift.',
      'Please break down the costs by department.',
    ],
    field: 'engineering',
    frequency: 'mid',
    quiz: {
      questionUz: 'Xarajatlarni bo‘limlarga ajratish — qaysi ma’no?',
      options: ['analyze in detail', 'malfunction only', 'give up', 'speed up'],
      answerIndex: 0,
    },
  },
  {
    id: 'pv-roll-out',
    verb: 'roll out',
    meaningUz: 'Joriy etmoq, bosqichma-bosqich chiqarmoq',
    formalAlternative: 'launch / deploy',
    examples: [
      'We will roll out the new software next month.',
      'The company rolled out updated safety procedures.',
    ],
    field: 'computing',
    frequency: 'mid',
    quiz: {
      questionUz: 'Dasturiy ta’minotni ishga tushirish — rasmiy so‘z?',
      options: ['deploy', 'roll over', 'roll back only', 'roll in'],
      answerIndex: 0,
    },
  },
];

export function filterPhrasalVerbs(field?: FieldType | 'all'): PhrasalVerb[] {
  if (!field || field === 'all') return PHRASAL_VERBS;
  return PHRASAL_VERBS.filter((pv) => pv.field === field);
}
