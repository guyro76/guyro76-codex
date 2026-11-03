/** Free-licensed images shown next to the correct answer (Wikimedia Commons).
 *  Each one keeps its author, licence and source page, shown as a credit under the image.
 *  Resized to 640px for the game (CC licences allow adaptation with attribution). Photos only of
 *  places, nature and works of art: never photos of real people. */
export type AnswerImage={src:string;w:number;h:number;author:string;license:string;licenseUrl:string;page:string};
export const ANSWER_IMAGES:Readonly<Record<number,AnswerImage>>={
  990000:{src:'/answer-images/990000.webp',w:640,h:429,author:"Jean Housen",license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',page:'https://commons.wikimedia.org/wiki/File:20100923_mer_morte13.JPG'},
  990002:{src:'/answer-images/990002.webp',w:640,h:367,author:"Yigal Dekel",license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',page:'https://commons.wikimedia.org/wiki/File:Eilat_night_hotels_2016.jpg'},
  990003:{src:'/answer-images/990003.webp',w:640,h:391,author:"Zachi Evenor, MathKnight",license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/',page:'https://commons.wikimedia.org/wiki/File:Kinneret_cropped.jpg'},
  990005:{src:'/answer-images/990005.webp',w:640,h:640,author:"Giladtop",license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',page:'https://commons.wikimedia.org/wiki/File:%D7%A2%D7%A0%D7%A0%D7%99%D7%9D_%D7%9E%D7%A2%D7%9C_%D7%94%D7%99%D7%A8%D7%A7%D7%95%D7%9F.jpg'},
  990007:{src:'/answer-images/990007.webp',w:640,h:480,author:"BASWIM",license:'CC BY 3.0',licenseUrl:'https://creativecommons.org/licenses/by/3.0/',page:'https://commons.wikimedia.org/wiki/File:Beersheba_City_Hall_6.jpg'},
  990008:{src:'/answer-images/990008.webp',w:640,h:480,author:"Chadner",license:'Public domain',licenseUrl:'',page:'https://commons.wikimedia.org/wiki/File:Caiobadner_-_mount_carmel.JPG'},
  990089:{src:'/answer-images/990089.webp',w:640,h:640,author:"Matúš Motlo",license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',page:'https://commons.wikimedia.org/wiki/File:The_Sun_in_white_light.jpg'},
  990091:{src:'/answer-images/990091.webp',w:429,h:640,author:"Leonardo da Vinci",license:'Public domain',licenseUrl:'',page:'https://commons.wikimedia.org/wiki/File:Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'},
  990092:{src:'/answer-images/990092.webp',w:425,h:640,author:"Thurundir",license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',page:'https://commons.wikimedia.org/wiki/File:Gorille_des_plaines_de_l%27ouest_%C3%A0_l%27Espace_Zoologique.jpg'},
};
