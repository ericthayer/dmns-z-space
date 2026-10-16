/* Parser-blocking, tiny pre-paint bootstrap. No imports or network requests. */
(()=>{
  const root=document.documentElement;
  root.dataset.theme='dark';
  try{
    const theme=localStorage.getItem('dmns:theme');
    if(theme==='light'||theme==='dark')root.dataset.theme=theme;
    if(theme==='system')delete root.dataset.theme;
    if(localStorage.getItem('dmns:stillness')==='true')root.dataset.stillness='true';
  }catch{/* Storage denied: retain safe defaults. */}
})();
