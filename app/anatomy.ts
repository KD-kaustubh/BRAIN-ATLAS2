/** Height of the modelled brain's centre above the viewer stage, in metres. Must match scripts/build-brain-atlas.mjs. */
export const STAGE = 0.65;
export type SystemId = 'cortex'|'whitematter'|'limbic'|'diencephalon'|'brainstem'|'cerebellum'|'ventricles'|'cranialnerves'|'meninges';
export const SYSTEMS: {id:SystemId;name:string;color:string;description:string}[] = [
 {id:'cortex',name:'Cerebral cortex',color:'#c4a091',description:'The folded outer sheet of the cerebral hemispheres. Its gyri and sulci organise regions for movement, sensation, vision, hearing, language, and higher-order association.'},
 {id:'whitematter',name:'White matter',color:'#e0d6c0',description:'Bundles of myelinated axons that connect cortical regions to each other and to deeper structures. Commissures cross between hemispheres; projection fibres run to the brainstem and spinal cord.'},
 {id:'limbic',name:'Basal ganglia & limbic',color:'#a8829b',description:'Deep grey-matter nuclei beneath the cortex. The basal ganglia shape the initiation and scaling of movement, while limbic structures support memory formation and emotional processing.'},
 {id:'diencephalon',name:'Diencephalon',color:'#c9a35f',description:'The central core between the brainstem and the cerebral hemispheres. The thalamus relays sensory and motor signals to the cortex; the hypothalamus regulates hormones, appetite, temperature, and sleep.'},
 {id:'brainstem',name:'Brainstem',color:'#9aa87f',description:'Midbrain, pons, and medulla oblongata. Long tracts pass through on their way to and from the spinal cord, and its nuclei govern breathing, heart rate, arousal, and most cranial nerve function.'},
 {id:'cerebellum',name:'Cerebellum',color:'#8fa9b8',description:'The densely folded structure behind the brainstem. It compares intended movement with actual movement, refining coordination, balance, and timing.'},
 {id:'ventricles',name:'Ventricular spaces',color:'#7fb0ae',description:'The fluid-filled cavities and channels within the brain. Cerebrospinal fluid produced here circulates around the brain and spinal cord, cushioning and supporting the tissue.'},
 {id:'cranialnerves',name:'Cranial nerves',color:'#d5b25f',description:'Nerves that leave the brain directly rather than through the spinal cord, along with the optic pathway carrying vision from the eyes to the thalamus and midbrain.'},
 {id:'meninges',name:'Meninges',color:'#aeb3bb',description:'The membranes that enclose and partition the brain. The dural folds separate the hemispheres and support the occipital lobes above the cerebellum.'},
];
export interface Part {id:string;name:string;conceptId:string;system:SystemId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
export type View = 'three-quarter'|'anterior'|'lateral'|'superior'|'posterior';
export const VIEWS:{id:View;label:string;name:string}[] = [
 {id:'three-quarter',label:'OBL',name:'Oblique view'},
 {id:'anterior',label:'ANT',name:'Anterior view'},
 {id:'lateral',label:'LAT',name:'Lateral view'},
 {id:'superior',label:'SUP',name:'Superior view'},
 {id:'posterior',label:'POS',name:'Posterior view'},
];
export type SliceAxis = 'none'|'sagittal'|'coronal'|'axial';
/** Index of the world axis each cut runs along: x separates left from right, y top from bottom, z front from back. */
export const SLICE_AXIS:Record<Exclude<SliceAxis,'none'>,0|1|2> = {sagittal:0,axial:1,coronal:2};
export const SLICES:{id:SliceAxis;label:string;name:string}[] = [
 {id:'none',label:'Off',name:'No cut'},
 {id:'sagittal',label:'SAG',name:'Sagittal cut, separating left from right'},
 {id:'coronal',label:'COR',name:'Coronal cut, separating front from back'},
 {id:'axial',label:'AXI',name:'Axial cut, separating top from bottom'},
];
export interface SceneState {inspectorOpen?:boolean;explode:number;visible:SystemId[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number;slice:SliceAxis;sliceAt:number;sliceFlip:boolean;sliceTrack:boolean}
export const DEFAULT_VISIBLE:SystemId[] = ['cortex','whitematter','limbic','diencephalon','brainstem','cerebellum','ventricles','cranialnerves'];
export const PRESETS:{name:string;systems:SystemId[]}[] = [
 {name:'Cortex',systems:['cortex']},
 {name:'Deep brain',systems:['limbic','diencephalon','whitematter','ventricles']},
 {name:'Brainstem',systems:['brainstem','cerebellum','cranialnerves']},
];
export const FEATURED = ['cerebellum','hippocampus','thalamus','amygdala','corpus callosum','pons','hypothalamus','insula'];
export const EXPLANATIONS:Record<string,string> = {
 'cerebellum':'The "little brain" behind the brainstem. It compares the movement the cortex intended with the movement that actually occurred, correcting coordination, balance, posture, and the timing of skilled actions.',
 'hippocampus':'A curved structure in the medial temporal lobe. It binds experiences into memories that can later be recalled, and supports spatial navigation. Damage here impairs the formation of new long-term memories.',
 'amygdala':'An almond-shaped nucleus in front of the hippocampus. It evaluates the emotional significance of what is perceived, particularly threat, and drives autonomic and behavioural responses to it.',
 'thalamus':'The central relay of the forebrain. Nearly all sensory information except smell passes through its nuclei before reaching the cortex, and it participates in attention, arousal, and motor circuits.',
 'hypothalamus':'A small region beneath the thalamus with wide-reaching control. It regulates temperature, hunger and thirst, sleep and circadian rhythm, stress responses, and hormone release through the pituitary gland.',
 'corpus callosum':'The largest commissure of the brain. Its fibres cross the midline to connect matching regions of the two cerebral hemispheres, allowing them to share sensory, motor, and cognitive information.',
 'pons':'The bulging middle section of the brainstem. It carries tracts between the cerebrum and cerebellum, contains nuclei for several cranial nerves, and contributes to breathing rhythm and sleep regulation.',
 'medulla oblongata':'The lowest part of the brainstem, continuous with the spinal cord. Its centres control heart rate, blood pressure, breathing, swallowing, coughing, and vomiting.',
 'midbrain':'The uppermost segment of the brainstem. It houses the colliculi for visual and auditory reflexes, the substantia nigra and red nucleus for movement, and the nuclei of the oculomotor and trochlear nerves.',
 'insula':'Cortex folded deep within the lateral sulcus, hidden by the frontal, parietal, and temporal opercula. It processes taste, visceral sensation, pain, and awareness of the body’s internal state.',
 'caudate nucleus':'A C-shaped nucleus of the basal ganglia curving alongside the lateral ventricle. With the putamen it forms the striatum, the main input stage for circuits controlling movement, habit, and reward.',
 'putamen':'The outer nucleus of the striatum, lateral to the globus pallidus. It contributes to the selection and scaling of movement and to the learning of motor habits.',
 'globus pallidus':'The pale inner nucleus of the basal ganglia. It is the main output stage of the circuit, inhibiting thalamic targets until movement is released.',
 'internal capsule':'A dense fan of projection fibres between the thalamus, caudate, and lentiform nuclei. Motor and sensory pathways for the whole body are concentrated here, so small lesions can cause extensive deficits.',
 'fornix of forebrain':'An arching white-matter tract carrying output from the hippocampus to the mammillary bodies and septal region. It forms a central link in the circuit supporting episodic memory.',
 'anterior commissure':'A compact bundle of fibres crossing the midline in front of the fornix. It connects the temporal lobes, olfactory regions, and parts of the amygdala across hemispheres.',
 'posterior commissure':'Fibres crossing the midline at the junction of the midbrain and diencephalon. It carries connections involved in pupillary reflexes and coordinated eye movement.',
 'commissure of fornix of forebrain':'Fibres that cross between the two fornices beneath the corpus callosum, linking the hippocampal formations of the two hemispheres.',
 'white matter of cerebral hemisphere':'The mass of myelinated axons beneath the cortex. Association fibres connect regions within a hemisphere, commissural fibres cross to the other side, and projection fibres descend to the brainstem and cord.',
 'precentral gyrus':'The primary motor cortex, immediately in front of the central sulcus. Its neurons are arranged as a map of the body and drive voluntary movement through the corticospinal tract.',
 'postcentral gyrus':'The primary somatosensory cortex, immediately behind the central sulcus. It receives touch, pressure, vibration, and position sense, arranged as a map of the opposite side of the body.',
 'superior frontal gyrus':'The uppermost gyrus of the frontal lobe. It contributes to planning, working memory, self-awareness, and the supplementary motor area that prepares sequences of movement.',
 'middle frontal gyrus':'A frontal gyrus supporting working memory, attention, and executive control, including the frontal eye field that directs voluntary gaze.',
 'inferior frontal gyrus':'The lowest frontal gyrus. On the dominant hemisphere it contains Broca’s area, central to producing fluent, grammatical speech.',
 'superior temporal gyrus':'The upper temporal gyrus, containing the primary auditory cortex. Its posterior portion on the dominant side forms Wernicke’s area, essential to understanding language.',
 'middle temporal gyrus':'A temporal gyrus involved in recognising objects and faces, retrieving word meaning, and perceiving visual motion.',
 'inferior temporal gyrus':'The lowest temporal gyrus and the end of the ventral visual stream. It supports recognition of complex forms, objects, and faces.',
 'fusiform gyrus':'A gyrus on the underside of the temporal lobe. It is central to recognising faces, written words, and other highly familiar visual forms.',
 'parahippocampal gyrus':'The cortex wrapping the hippocampus. It relays information between the neocortex and hippocampus and contributes to recognising places and scenes.',
 'cingulate gyrus':'An arc of cortex above the corpus callosum. It links emotion with action, monitors conflict and errors, and contributes to pain perception and motivation.',
 'angular gyrus':'Parietal cortex at the back of the lateral sulcus. It integrates vision, hearing, and touch, and supports reading, number sense, and word meaning.',
 'supramarginal gyrus':'Parietal cortex arching over the end of the lateral sulcus. It supports the phonological handling of language and the awareness of limb position and gesture.',
 'superior parietal lobule':'Parietal cortex behind the somatosensory strip. It builds spatial representations of the body and its surroundings and guides reaching and attention.',
 'occipital lobe':'The rearmost lobe of the cerebrum. It holds the primary visual cortex and surrounding areas that construct form, colour, depth, and motion from retinal input.',
 'orbital gyrus':'Frontal cortex resting on the orbital plate above the eyes. It contributes to evaluating reward and risk, social behaviour, and the sense of smell.',
 'septum of telencephalon':'A midline structure below the front of the corpus callosum. Connected with the hippocampus and hypothalamus, it participates in memory, reward, and autonomic regulation.',
 'habenula':'A small epithalamic nucleus near the roof of the third ventricle. It links limbic input to brainstem monoamine systems and is implicated in responses to disappointment and aversion.',
 'mammillary body':'Paired hypothalamic nuclei at the base of the brain. They receive hippocampal output through the fornix and form part of the circuit supporting episodic memory.',
 'tuber cinereum':'A grey eminence in the floor of the hypothalamus, continuous with the pituitary stalk. It is a route for hypothalamic control of pituitary hormone release.',
 'lamina terminalis':'The thin membrane forming the anterior wall of the third ventricle. Neighbouring nuclei sense blood composition and help regulate thirst and fluid balance.',
 'lateral geniculate body':'The visual relay nucleus of the thalamus. Retinal signals arriving through the optic tract are sorted here before travelling to the primary visual cortex.',
 'medial geniculate body':'The auditory relay nucleus of the thalamus. It passes signals from the inferior colliculus to the auditory cortex of the temporal lobe.',
 'superior colliculus':'A paired swelling on the roof of the midbrain. It builds a map of visual space and drives orienting movements of the eyes and head.',
 'inferior colliculus':'A paired swelling below the superior colliculus. Nearly all ascending auditory pathways converge here before continuing to the thalamus.',
 'brachium of superior colliculus':'The fibre bundle carrying visual input from the optic tract into the superior colliculus.',
 'brachium of inferior colliculus':'The fibre bundle carrying auditory output from the inferior colliculus to the medial geniculate body of the thalamus.',
 'peduncle of midbrain':'The massive bundles on the front of the midbrain. Descending fibres from the cortex to the brainstem and spinal cord are gathered here.',
 'interpeduncular fossa':'The depression between the two midbrain peduncles. The oculomotor nerves emerge along its walls.',
 'cerebral aqueduct':'The narrow channel through the midbrain connecting the third and fourth ventricles. Obstruction here raises pressure in the ventricles above it.',
 'central canal of spinal cord':'The fluid-filled channel continuing from the fourth ventricle down the length of the spinal cord.',
 'stria terminalis':'A slender tract following the curve of the caudate nucleus. It carries output from the amygdala to the hypothalamus and septal region.',
 'stria medullaris of thalamus':'A fibre bundle along the upper edge of the thalamus carrying limbic and septal input to the habenula.',
 'optic nerve':'The second cranial nerve, carrying visual signals from the retina. It is an extension of the central nervous system rather than a typical peripheral nerve.',
 'optic chiasm':'The junction where the optic nerves partly cross. Fibres from the inner half of each retina change sides, so each hemisphere receives the opposite half of the visual field.',
 'optic tract':'The continuation of the visual pathway behind the chiasm, carrying the opposite visual field to the lateral geniculate body, superior colliculus, and hypothalamus.',
 'trochlear nerve':'The fourth cranial nerve. It supplies the superior oblique muscle and is the only cranial nerve to leave the back of the brainstem.',
 'oculomotor nerve':'The third cranial nerve. It moves most of the eye muscles, raises the upper eyelid, and carries the parasympathetic fibres that constrict the pupil.',
 'ophthalmic nerve':'The first division of the trigeminal nerve. It carries sensation from the eye, upper eyelid, forehead, and scalp.',
 'ciliary ganglion':'A small parasympathetic ganglion behind the eye. Fibres relaying here control pupil constriction and the focusing of the lens.',
 'nasociliary nerve':'A branch of the ophthalmic nerve crossing the orbit. It supplies sensation to the eyeball, the ethmoidal air cells, and the skin near the bridge of the nose.',
 'frontal nerve':'The largest branch of the ophthalmic nerve, running forward above the eye muscles before dividing into the supra-orbital and supratrochlear nerves.',
 'lacrimal nerve':'A slender branch of the ophthalmic nerve supplying the lacrimal gland and the outer part of the upper eyelid.',
 'supra-orbital nerve':'A terminal branch of the frontal nerve. It leaves the orbit through the supra-orbital notch to supply the forehead and front of the scalp.',
 'supratrochlear nerve':'A terminal branch of the frontal nerve supplying the medial forehead and the upper eyelid near the nose.',
 'infratrochlear nerve':'A branch of the nasociliary nerve supplying the skin of the eyelids, the side of the nose, and the lacrimal sac.',
 'anterior ethmoidal nerve':'A branch of the nasociliary nerve passing into the nasal cavity to supply the mucosa and the skin at the tip of the nose.',
 'posterior ethmoidal nerve':'A small branch of the nasociliary nerve supplying the posterior ethmoidal and sphenoidal air cells.',
 'long ciliary nerve':'A branch of the nasociliary nerve carrying sensation from the cornea and iris, together with sympathetic fibres that dilate the pupil.',
 'short ciliary nerve':'Fine nerves leaving the ciliary ganglion to enter the back of the eyeball, carrying the parasympathetic fibres that constrict the pupil and focus the lens.',
 'communicating branch of nasociliary nerve with ciliary ganglion':'The sensory root of the ciliary ganglion. Fibres from the eyeball pass through the ganglion without relaying and continue in the nasociliary nerve.',
 'tentorium cerebelli':'A tough dural sheet stretched between the occipital lobes and the cerebellum. It separates the cerebrum above from the posterior fossa below.',
};
/** Source names carry side and subdivision qualifiers; explanations describe the structure itself. */
export function explanation(name:string,system:SystemId){
 const key=name.toLowerCase().replace(/\b(left|right)\b\s*/g,'').replace(/\s+/g,' ').trim();
 const stripped=key.replace(/^(anterior|posterior|inferior|superior|communicating|short|long)\s+(part|branch)\s+of\s+/,'');
 return EXPLANATIONS[key] ?? EXPLANATIONS[stripped] ?? SYSTEMS.find(s=>s.id===system)?.description ?? '';
}
