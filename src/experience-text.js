/* Experience map: running text. Checked against sources before publication. */
var SERIES=[
  ['Operations reviewed','1,288'],
  ['Patients','1,132'],
  ['Temporal lobe explored and stimulated','520'],
  ['of these, right side and left side','248 and 272'],
  ['Memory-like experience under the electrode','40 (7.7%)'],
  ['Memory-like experience in their own seizures','53 (10%)'],
  ['of these 53, a response at operation','24'],
  ['of these 24, with the same content','16'],
  ['Patients explored outside the temporal lobe','612'],
  ['of these, with a memory-like experience','0']
];
var CAP2='Each bar counts responses. A response is one point on the cortex that gave an experience, and a point stimulated more than once is counted once. Dominant means the hemisphere that carries speech. In two of the 40 patients speech was in the right hemisphere, so non-dominant does not always mean right. The 40 patients were 18 male and 22 female, and their average age at operation was 25.';
function REC(id,label){return ' <a class="lk" href="'+EXPURL+'#'+id+'">Record: '+label+'</a>';}
var ABOUT_A='<h2>About this map</h2>'+
'<h3>Wilder Penfield</h3>'+
'<p>Wilder Graves Penfield (1891 to 1976) was a neurosurgeon. He was born in Spokane, Washington, studied at Princeton and at Oxford, where Charles Sherrington introduced him to the study of the brain, and took his medical degree at Johns Hopkins in 1918. In 1928 he moved from New York to the Royal Victoria Hospital in Montreal with his surgical partner William Cone. In 1934 he founded the Montreal Neurological Institute. He directed it until 1960 and died in Montreal.</p>'+
'<p>His subject was epilepsy. He operated under local anaesthetic, so the patient was conscious. He stimulated points on the exposed cortex with an electric current and recorded what the patient reported. The aim was to find and remove the tissue where the seizures began. This way of operating became known as the Montreal procedure. The responses on this page were recorded during those operations.</p>'+
'<h3>What the temporal lobe gave</h3>'+
'<p>On the sensorimotor strip a current gives a movement or a tingling in some part of the body. That is the subject of the <a href="'+BODYURL+'">Body map</a>. On the anterior transverse gyrus of Heschl it gives a crude sound such as buzzing. Elsewhere in the temporal lobe Penfield sometimes got something of another kind. A patient heard a voice or a piece of music, or saw people or a place, and often knew it as something from the past. He called this an experiential response. He first reported one in 1938. In 1963, with Phanor Perot, he published a final summary of every case.</p>'+
'<p>That paper reviews 1,288 consecutive operations on 1,132 patients. The temporal lobe was explored and stimulated in 520 of them. Forty reported a memory-like experience under the electrode. Among the 612 patients explored elsewhere, none did.</p>'+
'<p>The stimulus usually used was a train of square-wave pulses, each of 2 to 5 milliseconds, 40 to 100 a second, at 1 to 5 volts. The patients stayed aware of the operating room while the experience ran. Where it could be tested, the experience moved forward at a normal pace while the current was on and stopped when the electrode was lifted. Occasionally it outlasted the stimulus.</p>'+
'<p>A second kind of response brought nothing back. It changed how the present seemed: familiar, strange, louder, nearer, frightening. The paper calls these interpretive illusions, and it calls the cortex that gave both kinds of response the interpretive cortex.</p>'+
'<p>Some kinds of experience never came. The paper lists them: making up one’s mind, skilled acts, speaking, writing, adding figures, eating and tasting, sexual experience, painful suffering and weeping.</p>'+
'<p>The authors do not claim that the temporal cortex holds the record of the past. They suggest that the record lies in circuits at a distance, and that this cortex can call it up.</p>'+
'<p class="src">Sources: Penfield &amp; Perot 1963. Penfield 1938, as cited there.</p>'+
'<h3>The original figures</h3>'+
'<p>The 1963 paper has summary maps. Figs 9 to 12 carry a numbered point for each response, Figs 7 and 13 show the points as dots, and Figs 1 and 14 letter the kinds of response on outline drawings of the two hemispheres. They are published artwork and are not reproduced on this site.</p>'+
'<ul class="abl2"><li>Penfield and Perot 1963, in the journal Brain. <a href="https://doi.org/10.1093/brain/86.4.595" rel="noopener">doi.org/10.1093/brain/86.4.595</a></li>'+
'<li>Penfield 1958, a lecture given in 1957. It marks the interpretive cortex on a photograph of the left hemisphere. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC335365/" rel="noopener">Free full text, PubMed Central</a></li></ul>';
var ABOUT_B='<h3>What later work changed</h3>'+
'<p>Groups that worked later with electrodes placed deep in the brain moved the source of these experiences inward. In one series of 29 patients, dream-like experiences came only when a seizure or the current reached the limbic structures deep in the temporal lobe, and the outer cortex did not have to take part. In another series a dreamy state could be started from the amygdala, from the hippocampus or from the outer cortex, and a larger share of the deep sites produced it.</p>'+
'<p>A review of 80 years of reports counted 273 stimulations that brought back a memory. Most of the memories were vague, about 14% were of one particular event, and well under 1% of stimulations produced one.</p>'+
'<p>Some doubt that these are memories at all. Loftus and Loftus read Penfield and Perot’s case notes and argued that even the most lifelike reports look like scenes the patient put together. Sjöberg argues that the patient may take a mental event for a memory, and says that neither account can yet be proved.</p>'+
'<p>A map of 1,537 stimulated sites in 67 patients shows how unevenly the brain answers. Stimulation produced a noticeable effect at just over half the sites in the networks for movement, touch and vision. In the limbic and default networks it did so at about a fifth to a quarter of the sites, and the effects there were more varied and included emotion and recall.</p>'+
'<p class="src">Sources: Gloor et al. 1982. Bancaud et al. 1994. Curot et al. 2017. Loftus &amp; Loftus 1980. Sjöberg 2023. Fox et al. 2020.</p>'+
'<h3>Significance to brain-computer interfaces</h3>'+
'<dl class="abl">'+
'<dt>Reading</dt> <dd>A song has been rebuilt from recordings made over the convolution where Penfield’s patients heard music. Twenty-nine patients listened to the song while their brain activity was recorded. Nothing was stimulated, and what was read out was a song being heard, not one imagined.'+REC('music','Music')+'</dd>'+
'<dt>Memory</dt> <dd>In 25 epilepsy patients a system watched brain activity while they learned lists of words, and gave a half-second burst of stimulation to the lateral temporal cortex when it predicted that a word would be forgotten. Words stimulated in this way were about 15% more likely to be recalled. The authors call it a proof of concept.</dd>'+
'<dt>Mood</dt> <dd>One woman with severe depression was given a device that answered a signal in her amygdala with six seconds of stimulation. Her depression score fell by more than half in 12 days. In a study of 25 epilepsy patients, 100 to 200 seconds of stimulation of the lateral orbitofrontal cortex lifted mood in those with moderate to severe symptoms of depression.'+REC('mood','Mood')+'</dd>'+
'<dt>Preference</dt> <dd>One man’s taste in music changed while a stimulator in his nucleus accumbens was running, and changed back when its batteries ran down.'+REC('wanting','A changed preference')+'</dd>'+
'<dt>Limits</dt> <dd>Nearly every finding on the experience map comes from people with epilepsy, or with another illness that was the reason for the electrodes. Several rest on one patient. Most stimulations produce no experience. In nine patients whose amygdala was stimulated, the body answered reliably and seven of them felt no emotion.'+REC('fear','Fear')+'</dd>'+
'</dl>'+
'<p class="src">Sources: Bellier et al. 2023. Ezzyat et al. 2018. Scangos et al. 2021. Rao et al. 2018. Mantione et al. 2014. Inman et al. 2020.</p>';
var METHODS=[
 ['Scope','The experience map shows what Penfield and Perot (1963) report from electrical stimulation of the temporal lobe: memory-like experiences, and altered interpretation of the present. A third layer adds feelings reported by later groups, mostly from other parts of the brain. It does not reproduce the 1963 figures.'],
 ['Counts','Counts of memory-like experiences are from Table V and section 7 of the 1963 paper. The figures for the series as a whole are from its sections 3 and 5. A count is a number of stimulation points unless it says patients. The count of music points by side was made for this site from the legend of Fig. 9 and the case reports, and is not in the paper.'],
 ['Cases','The case notes paraphrase the case reports in section 5 of the 1963 paper and carry its case numbers and page numbers. Each case is filed under the kind of response that the legends of Figs 9 to 12 give it. Patients’ words are not quoted at length. Some titles of pieces of music are given, as the paper prints them.'],
 ['Plate','Fig. 1 is an original schematic and is not to scale. Shading shows the convolution or surface that a source names. The numbered points of Figs 9 to 12 of the 1963 paper are not transferred to it. Structures on the inner face of the hemisphere or inside it are projected onto the side view in broken outline, and their positions are approximate.'],
 ['The present, altered','The interpretive illusions are described in the 1963 paper only in summary, in its Table II and Fig. 1, with reference to Mullan and Penfield (1959), which was not reached. The 1963 paper gives that study as 214 patients, 70 of them with illusions. A lecture Penfield gave in 1957, before the study was published, gives 217 and 38.'],
 ['Later work','Each later finding paraphrases its source, and the note after each reference says how much of the source was read. Nearly all the patients had epilepsy, and the electrodes were placed to find where their seizures began. Several findings rest on one patient. They are listed to show what has been reported, not how often it happens.'],
 ['Sides','Dominant means the hemisphere that carries speech. The plate shows one hemisphere and stands for either. The side for each finding is in its record.'],
 ['Source check','On 26 November 2026 every statement taken from the 1963 paper was checked against its pages in two separate passes, apart from the reading that wrote the page, and the corrections were applied. Each later source was read once for this site. The site has not been peer reviewed.'],
 ['Known gaps','Not reached: Mullan and Penfield 1959, Penfield 1938, Halgren et al. 1978 and the 2013 letter of Picard et al. Read as abstracts only: Gloor et al. 1982, Bancaud et al. 1994, Bartolomei et al. 2004, Meletti et al. 2006 and Caruana et al. 2015. Of Fried et al. 1998 only the opening paragraph and the figure legend were read. The count of three music sites in Wang et al. 2024 is from the preprint. The 1963 paper says that 31 of the 46 voice responses were recognised by the patient, but the legend of its Fig. 9 marks 17 voice responses as familiar, and the map leaves the figure out.'],
 ['Use','Check a finding against its source before citing it.']
];
