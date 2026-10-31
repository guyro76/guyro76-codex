export type GestureGame='scratch'|'sword'|'scissors';
export const gestureGames:GestureGame[]=['scratch','sword','scissors'];
export const gestureCopy={
 he:{scratch:'כרטיס גירוד',sword:'חרב טריוויה',scissors:'מספרי המזל',scratchHelp:'גרדו 6 משבצות שונות כדי לחשוף את הפרס. במקלדת: בחרו משבצת ולחצו Enter.',swordHelp:'חתכו את כל שלושת סמלי השאלה. אפשר לגרור או ללחוץ על כל סמל.',scissorsHelp:'חתכו את הסרט לאורך שלושת הסימונים. אפשר לגרור או ללחוץ על כל סימון.',target:'סימון',progress:'התקדמות'},
 en:{scratch:'Scratch card',sword:'Trivia sword',scissors:'Lucky scissors',scratchHelp:'Reveal 6 different tiles for your prize. Keyboard: focus a tile and press Enter.',swordHelp:'Slice all three question symbols. Drag across them or select each symbol.',scissorsHelp:'Cut the ribbon along all three marks. Drag across them or select each mark.',target:'Target',progress:'Progress'},
 ru:{scratch:'Скретч-карта',sword:'Меч викторины',scissors:'Счастливые ножницы',scratchHelp:'Откройте 6 разных клеток. С клавиатуры: выберите клетку и нажмите Enter.',swordHelp:'Разрежьте все три знака вопроса. Проведите по ним или нажмите каждый.',scissorsHelp:'Разрежьте ленту по трём отметкам. Проведите по ним или нажмите каждую.',target:'Метка',progress:'Прогресс'},
 fr:{scratch:'Carte à gratter',sword:'Épée du quiz',scissors:'Ciseaux porte-bonheur',scratchHelp:'Révélez 6 cases différentes. Au clavier : sélectionnez une case et appuyez sur Entrée.',swordHelp:'Tranchez les trois points d’interrogation. Glissez dessus ou sélectionnez chaque symbole.',scissorsHelp:'Coupez le ruban aux trois repères. Glissez dessus ou sélectionnez chaque repère.',target:'Repère',progress:'Progression'},
 ar:{scratch:'بطاقة الخدش',sword:'سيف المعلومات',scissors:'مقص الحظ',scratchHelp:'اكشف 6 مربعات مختلفة. بلوحة المفاتيح: اختر مربعًا واضغط Enter.',swordHelp:'اقطع علامات الاستفهام الثلاث. اسحب فوقها أو اضغط على كل علامة.',scissorsHelp:'اقطع الشريط عند العلامات الثلاث. اسحب فوقها أو اضغط على كل علامة.',target:'علامة',progress:'التقدم'},
 es:{scratch:'Tarjeta para rascar',sword:'Espada del trivia',scissors:'Tijeras de la suerte',scratchHelp:'Descubre 6 casillas diferentes. Con el teclado: selecciona una casilla y pulsa Intro.',swordHelp:'Corta los tres signos de interrogación. Desliza sobre ellos o selecciona cada uno.',scissorsHelp:'Corta la cinta por las tres marcas. Desliza sobre ellas o selecciona cada marca.',target:'Marca',progress:'Progreso'}
};
export function requiredTargets(game:GestureGame){return game==='scratch'?6:3;}
export function markTarget(previous:readonly number[],index:number,total:number){
 return Number.isInteger(index)&&index>=0&&index<total&&!previous.includes(index)?[...previous,index]:[...previous];
}
