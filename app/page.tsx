import {flushSync} from 'react-dom';
import {registerAtlasTools} from './agent-tools';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import {Activity,ArrowUpRight,ChevronRight,Focus,Info,Layers3,Moon,Pause,RotateCcw,RotateCw,Search,Sun,X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Combobox,ComboboxInput,ComboboxContent,ComboboxList,ComboboxItem,ComboboxEmpty} from '@/components/ui/combobox';
import AnatomyScene from './scene';
import {DEFAULT_VISIBLE,FEATURED,PRESETS,SLICES,SYSTEMS,VIEWS,explanation,type Atlas,type Concept,type SceneState,type SystemId,type Theme} from './anatomy';
const initial:SceneState={explode:0,visible:DEFAULT_VISIBLE,selected:[],isolate:false,view:'three-quarter',rotate:false,reset:0,slice:'none',sliceAt:.5,sliceFlip:false,sliceTrack:false};
const THEME_KEY='brain-atlas-theme';
/** Storage is unavailable in some privacy modes, so a failed read just falls back to the system preference. */
function storedTheme():Theme{
 try{const saved=localStorage.getItem(THEME_KEY);if(saved==='light'||saved==='dark')return saved;}catch{/* fall through */}
 return matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
}
export default function Home(){
 const detailTitle=useRef<HTMLHeadingElement>(null);
 const [atlas,setAtlas]=useState<Atlas|null>(null),[state,setState]=useState(initial),[progress,setProgress]=useState(0),[error,setError]=useState(''),[panel,setPanel]=useState<'layers'|'search'|null>(null),[details,setDetails]=useState(false),[about,setAbout]=useState(false),[query,setQuery]=useState(''),[chosen,setChosen]=useState<Concept|null>(null),[theme,setTheme]=useState<Theme>(storedTheme);
 useEffect(()=>{const abort=new AbortController();setProgress(0);setError('');setAtlas(null);setChosen(null);setDetails(false);setState({...initial,visible:DEFAULT_VISIBLE});fetch('/models/atlas.json',{signal:abort.signal}).then(r=>{if(!r.ok)throw new Error('The brain catalogue could not be loaded.');return r.json();}).then(data=>setAtlas(data as Atlas)).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>abort.abort();},[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='/'&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)){e.preventDefault();setPanel('search');setDetails(false);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem(THEME_KEY,theme);}catch{/* preference is not persisted */}},[theme]);
 const parts=useMemo(()=>new Map(atlas?.parts.map(p=>[p.id,p])),[atlas]);
 const counts=useMemo(()=>Object.fromEntries(SYSTEMS.map(s=>[s.id,atlas?.parts.filter(p=>p.system===s.id).length??0])),[atlas]);
 const activeSystems=SYSTEMS.filter(s=>counts[s.id]>0);
 const selectedParts=state.selected.map(id=>parts.get(id)).filter(p=>!!p),selected=selectedParts[0],system=SYSTEMS.find(s=>s.id===selected?.system);
 const visibleCount=atlas?.parts.filter(p=>state.isolate?state.selected.includes(p.id):state.visible.includes(p.system)||state.selected.includes(p.id)).length??0;
 const results=useMemo(()=>{if(!atlas)return[];const term=query.toLowerCase().trim();if(!term)return FEATURED.map(name=>atlas.concepts.find(c=>c.name.toLowerCase()===name)).filter((x):x is Concept=>!!x);return atlas.concepts.filter(c=>c.name.toLowerCase().includes(term)||c.id.toLowerCase().includes(term)).sort((a,b)=>a.name.length-b.name.length).slice(0,80);},[atlas,query]);
 const choose=(c:Concept)=>{setChosen(c);setState(s=>({...s,selected:c.elements,isolate:false,rotate:false}));setDetails(true);setPanel(null);};
 useEffect(()=>{if(!atlas)return;return registerAtlasTools(atlas,c=>flushSync(()=>choose(c)));},[atlas]);
 const choosePart=(id:string)=>{const p=parts.get(id);if(!p)return;setChosen({id:p.conceptId,name:p.name,elements:[id]});setState(s=>({...s,selected:[id],isolate:false,rotate:false}));setDetails(true);setPanel(null);};
 const toggle=(id:SystemId)=>{setDetails(false);setState(s=>({...s,selected:[],isolate:false,visible:s.visible.includes(id)?s.visible.filter(x=>x!==id):[...s.visible,id]}));};
 const reset=()=>{setState(s=>({...initial,visible:DEFAULT_VISIBLE,reset:s.reset+1}));setChosen(null);setDetails(false);setPanel(null);};
 const openPanel=(next:'layers'|'search')=>{setDetails(false);setPanel(p=>p===next?null:next);};
 const caption=state.isolate?(chosen?.name??'Selected structure'):state.explode>.95?'Structure inventory':state.explode>.05?'Separated structures':'Human brain';
 return <main className="console">
  {atlas&&<AnatomyScene atlas={atlas} state={{...state,inspectorOpen:details&&selectedParts.length>0}} theme={theme} onSelect={choosePart} onSliceAt={at=>setState(s=>({...s,sliceAt:at}))} onProgress={n=>{setProgress(n);if(n===100)setError('');}} onError={setError}/>}
  <div className="scene-glow"/>

  <aside className={`rail ${panel==='layers'?'mobile-open':''}`} aria-label="Brain regions">
   <div className="rail-head">
    <div className="eyebrow"><span className="status-dot"/>Interactive neuroanatomy</div>
    <h1>Brain Atlas<span className="edition">3D</span></h1>
    <div className="rail-meta">{atlas?atlas.parts.length.toLocaleString():'139'} structures <span>/</span> BodyParts3D 4.0</div>
   </div>
   <div className="rail-body">
    <div className="rail-label"><span>Regions</span><Button variant="ghost" className="mobile-only icon-button" onClick={()=>setPanel(null)} aria-label="Close regions"><X size={18}/></Button><span className="small-number desktop-only">{activeSystems.length}</span></div>
    <div className="preset-row">
     <Button variant="ghost" aria-pressed={activeSystems.every(x=>state.visible.includes(x.id))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:activeSystems.map(x=>x.id)}))}>All</Button>
     {PRESETS.map(p=><Button variant="ghost" key={p.name} aria-pressed={state.visible.length===p.systems.length&&p.systems.every(id=>state.visible.includes(id))} onClick={()=>setState(s=>({...s,selected:[],isolate:false,visible:p.systems}))}>{p.name}</Button>)}
    </div>
    <div className="system-list">{activeSystems.map(s=>
     <div className={`system-row ${state.visible.includes(s.id)?'enabled':''}`} key={s.id} style={{'--swatch':s.color} as CSSProperties}>
      <Button variant="ghost" className="system-name" title={`Show only ${s.name.toLowerCase()}`} onClick={()=>setState(v=>({...v,visible:[s.id],isolate:false,selected:[]}))}><span className="system-swatch"/>{s.name}<span className="system-count">{counts[s.id]}</span></Button>
      <Switch checked={state.visible.includes(s.id)} onCheckedChange={()=>toggle(s.id)} aria-label={`Show ${s.name.toLowerCase()}`}/>
     </div>)}
    </div>
    <div className="slice-block">
     <div className="rail-label"><span>Cut plane</span>{state.slice!=='none'&&<span className="small-number">{Math.round(state.sliceAt*100)}%</span>}</div>
     <div className="preset-row">{SLICES.map(sl=><Button variant="ghost" key={sl.id} aria-pressed={state.slice===sl.id} disabled={state.explode>.05} title={sl.name} onClick={()=>setState(s=>({...s,slice:sl.id,sliceAt:s.slice===sl.id?s.sliceAt:.5}))}>{sl.label}</Button>)}</div>
     {state.slice!=='none'&&<>
      <Slider className="slice-slider" aria-label="Cut position" min={0} max={100} step={1} value={[state.sliceAt*100]} onValueChange={v=>setState(s=>({...s,sliceAt:(Array.isArray(v)?v[0]:v)/100}))}/>
      <div className="slice-toggles">
       <Button variant="ghost" aria-pressed={state.sliceTrack} title="Move the cut to whatever the pointer is over" onClick={()=>setState(s=>({...s,sliceTrack:!s.sliceTrack}))}>Follow cursor</Button>
       <Button variant="ghost" aria-pressed={state.sliceFlip} title="Keep the other half" onClick={()=>setState(s=>({...s,sliceFlip:!s.sliceFlip}))}>Flip</Button>
      </div>
     </>}
    </div>
    <div className="rail-foot"><span>{visibleCount.toLocaleString()} / {atlas?.parts.length.toLocaleString()??'139'} visible</span><Button variant="ghost" onClick={()=>setState(s=>({...s,visible:[],selected:[],isolate:false}))}>Hide all</Button></div>
   </div>
  </aside>

  <nav className="top-bar" aria-label="Explorer panels">
   <Button variant="ghost" className={panel==='search'?'active':''} onClick={()=>openPanel('search')} aria-label="Search the brain"><Search size={17}/><span>Find a structure</span><kbd>/</kbd></Button>
   <Button variant="ghost" className="icon-button" aria-label={theme==='light'?'Switch to dark theme':'Switch to light theme'} title={theme==='light'?'Dark theme':'Light theme'} onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>{theme==='light'?<Moon size={17}/>:<Sun size={17}/>}</Button>
   <Button variant="ghost" className="icon-button" aria-label="About this atlas" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}><Info size={17}/></Button>
  </nav>

  {panel==='search'&&<section className="search-panel" aria-label="Find a structure"><div className="panel-heading"><span>Find a structure</span><Button variant="ghost" className="icon-button" onClick={()=>setPanel(null)} aria-label="Close search"><X size={17}/></Button></div><Combobox<Concept> items={results} value={null} onValueChange={value=>{if(value)choose(value);}} inputValue={query} onInputValueChange={setQuery} itemToStringLabel={c=>c.name} filter={null} open onOpenChange={open=>{if(!open)setPanel(null);}}><ComboboxInput autoFocus placeholder="Hippocampus, thalamus, optic tract…" aria-label="Search named brain structures" showTrigger={false}/><ComboboxContent className="search-results"><ComboboxEmpty>No structures match your search.</ComboboxEmpty><ComboboxList>{(c:Concept)=><ComboboxItem key={c.id} value={c}><span className="search-result-name">{c.name}</span><span className="small-number">{c.elements.length}</span></ComboboxItem>}</ComboboxList></ComboboxContent></Combobox><p className="search-note">{query?'Showing up to 80 matches. Refine your search to find smaller structures.':'Start with a major region, or search every named structure.'}</p></section>}

  <nav className="view-rail" aria-label="Camera controls">
   {VIEWS.map(v=><Button variant="ghost" key={v.id} className={state.view===v.id?'active':''} aria-pressed={state.view===v.id} disabled={state.explode>.8&&v.id!=='anterior'} onClick={()=>setState(s=>({...s,view:v.id,reset:s.reset+1,rotate:false}))} title={v.name} aria-label={v.name}>{v.label}</Button>)}
   <i/>
   <Button variant="ghost" disabled={state.explode>=.4} className={state.rotate?'active':''} aria-label={state.rotate?'Pause rotation':'Rotate the brain'} title="Auto rotate" onClick={()=>setState(s=>({...s,rotate:!s.rotate}))}>{state.rotate?<Pause size={16}/>:<RotateCw size={16}/>}</Button>
  </nav>

  <div className="status-bar">
   <Button variant="ghost" className="mobile-only dock-layers" onClick={()=>openPanel('layers')} aria-label="Open brain regions"><Layers3 size={19}/><span>Regions</span></Button>
   <div className="status-caption desktop-only"><b>{caption}</b><span className="status-hint">{state.explode>.8?'Drag to pan':'Hover to identify'} · Click to inspect</span></div>
   <div className="explode-control">
    <div className="explode-head"><label id="explode-label">Explode</label><output>{Math.round(state.explode*100)}<span>%</span></output></div>
    <Slider aria-labelledby="explode-label" min={0} max={100} step={1} value={[state.explode*100]} onValueChange={v=>{const next=(Array.isArray(v)?v[0]:v)/100;setState(s=>({...s,explode:next,view:next>.8?'anterior':s.view,rotate:false,slice:next>.05?'none':s.slice}));}}/>
    <div className="slider-ends"><span>Assembled</span><span>Every structure</span></div>
   </div>
   <Button variant="ghost" className="status-reset" onClick={reset} aria-label="Assemble and reset"><RotateCcw size={16}/><span>Reset</span></Button>
   <Button variant="ghost" className="credit-link desktop-only" onClick={()=>{setDetails(false);setPanel(null);setAbout(true);}}>Source <ArrowUpRight size={12}/></Button>
  </div>

  {progress<100&&!error&&<div className="loading" role="status"><Activity size={18}/><div><strong>Preparing the brain</strong><span>{progress}% · Loading {atlas?.parts.length.toLocaleString()??'139'} structures</span><div className="loading-track"><i style={{width:`${progress}%`}}/></div></div></div>}
  {error&&<div className="loading error" role="alert"><p>{error}</p><Button variant="ghost" onClick={()=>location.reload()}>Reload viewer</Button></div>}

  <Sheet open={details&&selectedParts.length>0} modal={false} disablePointerDismissal onOpenChange={setDetails}><SheetContent initialFocus={detailTitle} className={`detail-sheet ${state.isolate?'is-isolated':''}`} showCloseButton={true}><div className="detail-header"><div className="detail-accent" style={{background:system?.color}}/><div className="eyebrow">{system?.name??'Brain'}</div><SheetTitle ref={detailTitle} tabIndex={-1} className="structure-title">{chosen?.name}</SheetTitle></div><div className="detail-scroll" key={`${chosen?.id}-${state.isolate}`}><SheetDescription className="structure-description">{chosen&&selected?explanation(chosen.name,selected.system):''}</SheetDescription>{chosen&&selected&&explanation(chosen.name,selected.system)===system?.description&&<span className="context-note">Region overview · structure identified from source anatomy</span>}<div className="structure-meta"><span>Atlas reference<strong>{chosen?.id}</strong></span><span>Selected meshes<strong>{state.selected.length.toLocaleString()}</strong></span></div>{selectedParts.length>1&&<div className="member-list"><h3>Included structures</h3>{selectedParts.slice(0,50).map(p=><Button variant="ghost" key={p.id} onClick={()=>choosePart(p.id)}><span>{p.name}</span><ChevronRight size={14}/></Button>)}{selectedParts.length>50&&<p>And {selectedParts.length-50} more modeled structures.</p>}</div>}<a className="source-link" href="https://lifesciencedb.jp/bp3d/" target="_blank" rel="noreferrer">View anatomical source <ArrowUpRight size={13}/></a></div><div className="detail-actions"><Button className={`primary-action ${state.isolate?'active':''}`} onClick={()=>setState(s=>({...s,isolate:!s.isolate,explode:0}))}><Focus size={16}/>{state.isolate?'Show surrounding anatomy':'Isolate structure'}<ChevronRight size={15}/></Button><Button variant="ghost" className="secondary-action" onClick={()=>{setState(s=>({...s,selected:[],isolate:false}));setDetails(false);}}>Clear selection</Button></div></SheetContent></Sheet>

  <Sheet open={about} onOpenChange={setAbout}><SheetContent className="about-sheet"><div className="eyebrow">Source & scope</div><SheetTitle className="structure-title">A brain, taken apart.</SheetTitle><SheetDescription>Explore the human brain, brainstem, cerebellum, and cranial nerves in 3D.</SheetDescription><div className="about-copy"><p><strong>Brain · BodyParts3D</strong><br/>{atlas?.parts.length.toLocaleString()??'139'} individually selectable meshes and {atlas?.concepts.length.toLocaleString()??'308'} named concepts, drawn from the nervous system of the BodyParts3D adult reference anatomy.</p><p>This reference does not contain every neural structure or variation, and it models gross anatomy rather than cortical parcellations, nuclei, or fibre tracts resolved by imaging. Named concepts can contain multiple meshes; each source mesh is rendered once.</p><p>Colors and regional groupings are designed for exploration. The geometry is simplified for the web, and short explanations provide general educational context. This is an anatomical reference, not a diagnostic, surgical, or neuronavigation tool.</p><h3>Source</h3><p>BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.</p><a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">Dataset license <ArrowUpRight size={14}/></a><a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html" target="_blank" rel="noreferrer">Original geometry & metadata <ArrowUpRight size={14}/></a><a href="https://academic.oup.com/nar/article/37/suppl_1/D782/1000752" target="_blank" rel="noreferrer">Read the source publication <ArrowUpRight size={14}/></a></div></SheetContent></Sheet>
 </main>;
}
