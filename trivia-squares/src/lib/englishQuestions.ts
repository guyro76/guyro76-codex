// English-first trivia. Locally relevant global knowledge, not a translation of Hebrew data.
// No arithmetic, no Israeli-artist category. Editorial media facts are curated separately.
import {englishMediaQuestions} from './mediaQuestions';
export type EnglishQuestion={id:number;category:string;text:string;answers:string[];correct:number;difficulty:number};
export const englishCuratedQuestions:EnglishQuestion[]=[
  {
    "id": 1000,
    "category": "World geography",
    "text": "What is the capital of Canada?",
    "answers": [
      "Toronto",
      "Ottawa",
      "Vancouver",
      "Montreal"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 1001,
    "category": "World geography",
    "text": "Which continent contains the Andes Mountains?",
    "answers": [
      "South America",
      "Asia",
      "Africa",
      "Europe"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 1002,
    "category": "World geography",
    "text": "Which country is home to the city of Kyoto?",
    "answers": [
      "China",
      "South Korea",
      "Thailand",
      "Japan"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 1003,
    "category": "World geography",
    "text": "Which ocean lies between Africa and Australia?",
    "answers": [
      "Atlantic Ocean",
      "Pacific Ocean",
      "Indian Ocean",
      "Arctic Ocean"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 1004,
    "category": "World geography",
    "text": "What is the capital of New Zealand?",
    "answers": [
      "Auckland",
      "Wellington",
      "Christchurch",
      "Hamilton"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 1005,
    "category": "World geography",
    "text": "Which country is home to Machu Picchu?",
    "answers": [
      "Peru",
      "Chile",
      "Bolivia",
      "Ecuador"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 1006,
    "category": "World geography",
    "text": "What is the largest hot desert on Earth?",
    "answers": [
      "Gobi Desert",
      "Kalahari Desert",
      "Mojave Desert",
      "Sahara Desert"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 1007,
    "category": "World geography",
    "text": "Which river runs through Paris?",
    "answers": [
      "Thames",
      "Danube",
      "Seine",
      "Rhine"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 1008,
    "category": "World geography",
    "text": "What is the capital of Portugal?",
    "answers": [
      "Porto",
      "Lisbon",
      "Braga",
      "Coimbra"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 1009,
    "category": "World geography",
    "text": "Which country has the city of Marrakech?",
    "answers": [
      "Morocco",
      "Tunisia",
      "Algeria",
      "Egypt"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 1010,
    "category": "World geography",
    "text": "What is the capital of Australia?",
    "answers": [
      "Sydney",
      "Melbourne",
      "Perth",
      "Canberra"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 1011,
    "category": "World geography",
    "text": "Which continent is the island of Madagascar off the coast of?",
    "answers": [
      "Asia",
      "Europe",
      "Africa",
      "South America"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 1012,
    "category": "World geography",
    "text": "What is the capital of South Korea?",
    "answers": [
      "Busan",
      "Seoul",
      "Incheon",
      "Daegu"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 1013,
    "category": "World geography",
    "text": "Which country is famous for the fjords near Bergen?",
    "answers": [
      "Norway",
      "Sweden",
      "Finland",
      "Denmark"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 1014,
    "category": "World geography",
    "text": "Which mountain range separates much of Europe from Asia?",
    "answers": [
      "Alps",
      "Rocky Mountains",
      "Andes",
      "Ural Mountains"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 1015,
    "category": "World geography",
    "text": "Which European capital stands on the River Thames?",
    "answers": [
      "Paris",
      "Rome",
      "London",
      "Madrid"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 1016,
    "category": "World geography",
    "text": "What is the capital of Kenya?",
    "answers": [
      "Mombasa",
      "Nairobi",
      "Kisumu",
      "Eldoret"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 1017,
    "category": "World geography",
    "text": "Which continent includes the Atacama Desert?",
    "answers": [
      "South America",
      "North America",
      "Africa",
      "Asia"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 1018,
    "category": "Science and nature",
    "text": "Which gas makes up most of Earth's atmosphere?",
    "answers": [
      "Oxygen",
      "Carbon dioxide",
      "Helium",
      "Nitrogen"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 1019,
    "category": "Science and nature",
    "text": "What is the chemical symbol for gold?",
    "answers": [
      "Ag",
      "Fe",
      "Au",
      "Go"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 1020,
    "category": "Science and nature",
    "text": "Which organ pumps blood around the human body?",
    "answers": [
      "Liver",
      "Heart",
      "Brain",
      "Lung"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 1021,
    "category": "Science and nature",
    "text": "What process allows green plants to make sugars using sunlight?",
    "answers": [
      "Photosynthesis",
      "Evaporation",
      "Fermentation",
      "Respiration"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 1022,
    "category": "Science and nature",
    "text": "What is the hardest naturally occurring mineral on the Mohs scale?",
    "answers": [
      "Quartz",
      "Talc",
      "Gypsum",
      "Diamond"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 1023,
    "category": "Science and nature",
    "text": "What is the chemical symbol for sodium?",
    "answers": [
      "So",
      "S",
      "Na",
      "N"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 1024,
    "category": "Science and nature",
    "text": "What unit is used to measure electrical resistance?",
    "answers": [
      "Volt",
      "Ohm",
      "Watt",
      "Ampere"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 1025,
    "category": "Science and nature",
    "text": "How many bones does a typical adult human have?",
    "answers": [
      "206",
      "198",
      "212",
      "220"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 1026,
    "category": "Science and nature",
    "text": "What is the most abundant gas in the Sun?",
    "answers": [
      "Oxygen",
      "Nitrogen",
      "Neon",
      "Hydrogen"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 1027,
    "category": "Science and nature",
    "text": "What is the approximate speed of light in a vacuum?",
    "answers": [
      "30,000 km/s",
      "3,000 km/s",
      "300,000 km/s",
      "3,000,000 km/s"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 1028,
    "category": "Science and nature",
    "text": "Which layer of Earth's atmosphere has most weather?",
    "answers": [
      "Stratosphere",
      "Troposphere",
      "Mesosphere",
      "Thermosphere"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 1029,
    "category": "Science and nature",
    "text": "Which part of a plant generally absorbs water from the soil?",
    "answers": [
      "Roots",
      "Flowers",
      "Petals",
      "Seeds"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 1030,
    "category": "Science and nature",
    "text": "What is the SI unit of force?",
    "answers": [
      "Joule",
      "Watt",
      "Pascal",
      "Newton"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 1031,
    "category": "Science and nature",
    "text": "Which blood cells mainly carry oxygen?",
    "answers": [
      "Platelets",
      "White blood cells",
      "Red blood cells",
      "Stem cells"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 1032,
    "category": "Science and nature",
    "text": "Which planet in our solar system has the most prominent rings?",
    "answers": [
      "Venus",
      "Saturn",
      "Mars",
      "Mercury"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 1033,
    "category": "Science and nature",
    "text": "Which natural satellite orbits Earth?",
    "answers": [
      "The Moon",
      "Europa",
      "Titan",
      "Phobos"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 1034,
    "category": "Science and nature",
    "text": "Which star is at the centre of our solar system?",
    "answers": [
      "Sirius",
      "Polaris",
      "Betelgeuse",
      "The Sun"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 1035,
    "category": "Science and nature",
    "text": "Which planet is nearest to the Sun?",
    "answers": [
      "Venus",
      "Earth",
      "Mercury",
      "Mars"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 1036,
    "category": "History",
    "text": "In which year did World War II end?",
    "answers": [
      "1939",
      "1945",
      "1941",
      "1950"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 1037,
    "category": "History",
    "text": "Who was the first person to walk on the Moon?",
    "answers": [
      "Neil Armstrong",
      "Yuri Gagarin",
      "Buzz Aldrin",
      "Alan Shepard"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 1038,
    "category": "History",
    "text": "Which civilisation built the Colosseum in Rome?",
    "answers": [
      "Ancient Greeks",
      "Vikings",
      "Aztecs",
      "Ancient Romans"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 1039,
    "category": "History",
    "text": "Who is associated with the movable-type printing press in fifteenth-century Europe?",
    "answers": [
      "Isaac Newton",
      "Leonardo da Vinci",
      "Johannes Gutenberg",
      "Galileo Galilei"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 1040,
    "category": "History",
    "text": "Which civilisation built the city of Tikal?",
    "answers": [
      "Inca",
      "Maya",
      "Ancient Romans",
      "Phoenicians"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 1041,
    "category": "History",
    "text": "Which ancient civilisation used hieroglyphic writing along the Nile?",
    "answers": [
      "Ancient Egyptians",
      "Ancient Greeks",
      "Vikings",
      "Ancient Chinese"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 1042,
    "category": "History",
    "text": "Who was the first president of the United States?",
    "answers": [
      "Abraham Lincoln",
      "Thomas Jefferson",
      "John Adams",
      "George Washington"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 1043,
    "category": "History",
    "text": "In what year did the Berlin Wall fall?",
    "answers": [
      "1979",
      "1999",
      "1989",
      "1991"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 1044,
    "category": "History",
    "text": "Which empire was ruled by Augustus?",
    "answers": [
      "Ottoman Empire",
      "Roman Empire",
      "Mongol Empire",
      "Inca Empire"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 1045,
    "category": "History",
    "text": "In which century did the Renaissance begin in Italy?",
    "answers": [
      "14th century",
      "10th century",
      "18th century",
      "20th century"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 1046,
    "category": "Arts and culture",
    "text": "Who painted the Mona Lisa?",
    "answers": [
      "Vincent van Gogh",
      "Pablo Picasso",
      "Claude Monet",
      "Leonardo da Vinci"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 1047,
    "category": "Arts and culture",
    "text": "Who wrote the play Romeo and Juliet?",
    "answers": [
      "Charles Dickens",
      "Oscar Wilde",
      "William Shakespeare",
      "Jane Austen"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 1048,
    "category": "Arts and culture",
    "text": "Which composer wrote the Ninth Symphony that features Ode to Joy?",
    "answers": [
      "Wolfgang Mozart",
      "Ludwig van Beethoven",
      "Johann Sebastian Bach",
      "Frédéric Chopin"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 1049,
    "category": "Arts and culture",
    "text": "How many strings does a standard violin usually have?",
    "answers": [
      "Four",
      "Five",
      "Six",
      "Three"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 1050,
    "category": "Arts and culture",
    "text": "Which museum in Paris displays the Mona Lisa?",
    "answers": [
      "Musée d'Orsay",
      "Centre Pompidou",
      "Musée de l'Orangerie",
      "The Louvre"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 1051,
    "category": "Arts and culture",
    "text": "Who wrote The Hobbit?",
    "answers": [
      "C. S. Lewis",
      "Roald Dahl",
      "J. R. R. Tolkien",
      "George Orwell"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 1052,
    "category": "Arts and culture",
    "text": "What is the name of the Japanese art of paper folding?",
    "answers": [
      "Ikebana",
      "Origami",
      "Kabuki",
      "Haiku"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 1053,
    "category": "Arts and culture",
    "text": "Which instrument typically has 88 keys in its full-size form?",
    "answers": [
      "Piano",
      "Harp",
      "Violin",
      "Flute"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 1054,
    "category": "Arts and culture",
    "text": "Which art movement is associated with Claude Monet?",
    "answers": [
      "Cubism",
      "Surrealism",
      "Pop Art",
      "Impressionism"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 1055,
    "category": "Arts and culture",
    "text": "Who wrote Around the World in Eighty Days?",
    "answers": [
      "Victor Hugo",
      "Mark Twain",
      "Jules Verne",
      "H. G. Wells"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 1056,
    "category": "Arts and culture",
    "text": "Which language was Don Quixote originally written in?",
    "answers": [
      "French",
      "Spanish",
      "Italian",
      "Portuguese"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 1057,
    "category": "Arts and culture",
    "text": "What is the traditional Japanese three-line poem called?",
    "answers": [
      "Haiku",
      "Sonnet",
      "Limerick",
      "Ballad"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 1058,
    "category": "Sports and games",
    "text": "How many players does a football (soccer) team usually have on the field?",
    "answers": [
      "10",
      "9",
      "12",
      "11"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 1059,
    "category": "Sports and games",
    "text": "How many points is a free throw worth in basketball?",
    "answers": [
      "2",
      "3",
      "1",
      "4"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 1060,
    "category": "Sports and games",
    "text": "Which sport uses a shuttlecock?",
    "answers": [
      "Tennis",
      "Badminton",
      "Squash",
      "Cricket"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 1061,
    "category": "Sports and games",
    "text": "Which board game features a king, queen, bishops and rooks?",
    "answers": [
      "Chess",
      "Checkers",
      "Go",
      "Backgammon"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 1062,
    "category": "Sports and games",
    "text": "In tennis, which term means a score of zero?",
    "answers": [
      "Ace",
      "Deuce",
      "Break",
      "Love"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 1063,
    "category": "Sports and games",
    "text": "In which sport would you perform a butterfly stroke?",
    "answers": [
      "Running",
      "Cycling",
      "Swimming",
      "Rowing"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 1064,
    "category": "Sports and games",
    "text": "Which country hosted the 2016 Summer Olympics?",
    "answers": [
      "Japan",
      "Brazil",
      "China",
      "Greece"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 1065,
    "category": "Sports and games",
    "text": "In golf, what do you call a score of one under par on a hole?",
    "answers": [
      "Birdie",
      "Bogey",
      "Eagle",
      "Albatross"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 1066,
    "category": "Sports and games",
    "text": "How many sides are there on a traditional six-sided die?",
    "answers": [
      "4",
      "8",
      "10",
      "6"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 1067,
    "category": "Sports and games",
    "text": "Which sport is played on ice with a puck?",
    "answers": [
      "Field hockey",
      "Lacrosse",
      "Ice hockey",
      "Handball"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 1068,
    "category": "Food and daily life",
    "text": "Which ingredient is traditionally the main base of hummus?",
    "answers": [
      "Lentils",
      "Chickpeas",
      "Potatoes",
      "Rice"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 1069,
    "category": "Food and daily life",
    "text": "Which country is the dish sushi most strongly associated with?",
    "answers": [
      "Japan",
      "Italy",
      "Mexico",
      "India"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 1070,
    "category": "Food and daily life",
    "text": "Which fruit is traditionally used to make guacamole?",
    "answers": [
      "Mango",
      "Apple",
      "Banana",
      "Avocado"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 1071,
    "category": "Food and daily life",
    "text": "What is the main ingredient in traditional tofu?",
    "answers": [
      "Wheat",
      "Rice",
      "Soybeans",
      "Corn"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 1072,
    "category": "Food and daily life",
    "text": "Which spice gives many curries a yellow colour?",
    "answers": [
      "Black pepper",
      "Turmeric",
      "Cinnamon",
      "Cloves"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 1073,
    "category": "Food and daily life",
    "text": "Which food is made by fermenting milk?",
    "answers": [
      "Yoghurt",
      "Bread",
      "Pasta",
      "Olive oil"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 1074,
    "category": "Food and daily life",
    "text": "Which grain is used to make traditional risotto?",
    "answers": [
      "Barley",
      "Wheat",
      "Oats",
      "Rice"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 1075,
    "category": "Food and daily life",
    "text": "What is the name of the Japanese green tea powder?",
    "answers": [
      "Sencha",
      "Oolong",
      "Matcha",
      "Rooibos"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 1076,
    "category": "Food and daily life",
    "text": "Which country is widely associated with paella?",
    "answers": [
      "Greece",
      "Spain",
      "France",
      "Turkey"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 1077,
    "category": "Food and daily life",
    "text": "Which fruit is dried to make a raisin?",
    "answers": [
      "Grape",
      "Plum",
      "Apricot",
      "Fig"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 1078,
    "category": "Technology",
    "text": "What does CPU stand for?",
    "answers": [
      "Computer Personal Utility",
      "Central Program Upload",
      "Core Power Unit",
      "Central Processing Unit"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 1079,
    "category": "Technology",
    "text": "What does HTML stand for?",
    "answers": [
      "High Transfer Machine Language",
      "Hyperlink Text Module Library",
      "HyperText Markup Language",
      "Host Transfer Markup Link"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 1080,
    "category": "Technology",
    "text": "Which two digits are used in the binary number system?",
    "answers": [
      "1 and 2",
      "0 and 1",
      "0 and 9",
      "2 and 8"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 1081,
    "category": "Technology",
    "text": "Which company created the JavaScript language in the 1990s?",
    "answers": [
      "Netscape",
      "Microsoft",
      "IBM",
      "Apple"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 1082,
    "category": "Technology",
    "text": "What does GPS stand for?",
    "answers": [
      "General Path Signal",
      "Global Picture Service",
      "Ground Position Satellite",
      "Global Positioning System"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 1083,
    "category": "Technology",
    "text": "Which device is mainly used to route network traffic between networks?",
    "answers": [
      "Monitor",
      "Keyboard",
      "Router",
      "Scanner"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 1084,
    "category": "Technology",
    "text": "What does URL stand for?",
    "answers": [
      "Universal Radio Link",
      "Uniform Resource Locator",
      "User Reference Layer",
      "Uniform Router Login"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 1085,
    "category": "Technology",
    "text": "What does USB stand for?",
    "answers": [
      "Universal Serial Bus",
      "Unified Signal Battery",
      "User System Base",
      "Universal Storage Board"
    ],
    "correct": 0,
    "difficulty": 2
  },
  {
    "id": 1086,
    "category": "Technology",
    "text": "Which technology uses short-range radio for connecting headphones to a phone?",
    "answers": [
      "NFC only",
      "GPS",
      "Ethernet",
      "Bluetooth"
    ],
    "correct": 3,
    "difficulty": 3
  },
  {
    "id": 1087,
    "category": "Technology",
    "text": "Which symbol appears in standard email addresses between the user and domain?",
    "answers": [
      "#",
      "%",
      "@",
      "&"
    ],
    "correct": 2,
    "difficulty": 1
  },
  {
    "id": 1100,
    "category": "Nature and wildlife",
    "text": "Which mammal is famous for being able to fly?",
    "answers": [
      "Penguin",
      "Bat",
      "Ostrich",
      "Dolphin"
    ],
    "correct": 1,
    "difficulty": 2
  },
  {
    "id": 1101,
    "category": "Nature and wildlife",
    "text": "What type of animal is a frog?",
    "answers": [
      "Amphibian",
      "Bird",
      "Mammal",
      "Reptile"
    ],
    "correct": 0,
    "difficulty": 3
  },
  {
    "id": 1102,
    "category": "Nature and wildlife",
    "text": "Which animal produces honey?",
    "answers": [
      "Ant",
      "Butterfly",
      "Dragonfly",
      "Honey bee"
    ],
    "correct": 3,
    "difficulty": 1
  },
  {
    "id": 1103,
    "category": "Nature and wildlife",
    "text": "Which mammal has black and white stripes?",
    "answers": [
      "Tiger",
      "Leopard",
      "Zebra",
      "Giraffe"
    ],
    "correct": 2,
    "difficulty": 2
  },
  {
    "id": 1104,
    "category": "Nature and wildlife",
    "text": "Which bird is a symbol of Antarctica?",
    "answers": [
      "Ostrich",
      "Penguin",
      "Toucan",
      "Hummingbird"
    ],
    "correct": 1,
    "difficulty": 3
  },
  {
    "id": 1105,
    "category": "Nature and wildlife",
    "text": "What is the largest living animal?",
    "answers": [
      "Blue whale",
      "African elephant",
      "Giraffe",
      "Giant squid"
    ],
    "correct": 0,
    "difficulty": 1
  },
  {
    "id": 1106,
    "category": "Nature and wildlife",
    "text": "What do caterpillars usually become after metamorphosis?",
    "answers": [
      "Fish",
      "Beetles only",
      "Spiders",
      "Butterflies or moths"
    ],
    "correct": 3,
    "difficulty": 2
  },
  {
    "id": 1107,
    "category": "Nature and wildlife",
    "text": "Which animal is classified as a marsupial?",
    "answers": [
      "Lion",
      "Horse",
      "Kangaroo",
      "Wolf"
    ],
    "correct": 2,
    "difficulty": 3
  },
  {
    "id": 1108,
    "category": "Nature and wildlife",
    "text": "Which type of tree produces acorns?",
    "answers": [
      "Pine",
      "Oak",
      "Palm",
      "Birch"
    ],
    "correct": 1,
    "difficulty": 1
  },
  {
    "id": 1109,
    "category": "Nature and wildlife",
    "text": "Which plant part usually contains seeds inside a fruit?",
    "answers": [
      "Ovary",
      "Root",
      "Stem",
      "Leaf"
    ],
    "correct": 0,
    "difficulty": 2
  }
];
export const englishQuestions:EnglishQuestion[]=[
 ...englishCuratedQuestions,
 ...englishMediaQuestions.map(q=>({id:q.id,text:q.text,category:q.category,answers:q.answers,correct:q.correct,difficulty:q.difficulty}))
];
