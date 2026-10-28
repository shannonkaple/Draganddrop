// Native buttons retain Enter/Space activation and trackpad clicks.
export function enablePickerArrows(grid){
 const buttons=[...grid.querySelectorAll('button')];
 const focus=button=>{
  button.focus({preventScroll:true});
  button.scrollIntoView({block:'nearest',inline:'nearest'});
 };
 grid.addEventListener('keydown',event=>{
  const index=buttons.indexOf(event.target);
  if(index<0||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();
  const top=buttons[0].getBoundingClientRect().top;
  const columns=buttons.filter(button=>Math.abs(button.getBoundingClientRect().top-top)<2).length;
  const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-columns,ArrowDown:columns}[event.key];
  focus(buttons[Math.max(0,Math.min(buttons.length-1,index+step))]);
 });
 if(buttons.length)focus(buttons[0]);
}
