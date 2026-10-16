import { MORE_STORIES } from "./bondStoriesMore.js";
import { REST_STORIES } from "./bondStoriesRest.js";
import { ROSTER_STORIES } from "./bondRoster.js";

const s = (title, body) => ({ title, body });

export const BOND_STORIES = {
  soren: [
    s(
      "The bow he didn't finish",
      "A traveler with a split knuckle starts the thank-you the coastal court taught people to give a healer: a bow, a title, a little applause. Soren gets halfway through the matching bow and stops, one hand still in the air, like he has forgotten the rest of a dance. \"Don't,\" he says. He sits on the step, rinses the cut, and wraps it too tight, then too loose, then right. The traveler flexes the hand. Soren nods as if the nod is new. \"I meant that part.\""
    ),
    s(
      "Eight, badly",
      "After he closes a burn on Caelor's forearm, Soren puts his forehead on his knees and breathes like a man who has been under too long. Caelor stays. He will not look at the new skin. \"My brother used to count for me,\" he says, and then he doesn't finish. Soren counts eight breaths out loud anyway and loses his place at six. Caelor huffs, almost a laugh. Neither of them calls it a rite."
    ),
    s(
      "Not a prop",
      "The court that trained him sends a note. The sea-glass ring was a prop, and props come back when the courtesy ends. Soren carries it to Ivelisse because she is the person he trusts with paper. She reads the note, scratches out \"prop,\" and writes \"his\" in the margin. \"They don't get to end it,\" she says. He puts the ring on. It is a little too big. He does not take it off."
    ),
  ],
  vesper: [
    s(
      "The candle she lights",
      "The temple put the candles out at a set hour so no one would come asking after dark. Vaelisse lights one anyway and sets it in the window that faces the road. Nylas, passing on his way to file a false oracle, stops because the flame is the wrong size for a show. She pours him water and does not offer a prophecy. He sits until the wax is a puddle. \"People sleep easier,\" she says, \"when someone is willing to stay up.\""
    ),
    s(
      "The name she let through",
      "She can still recite the petitioners she turned away, the ones who wanted a flattering future and a witness to it. One name is missing from that list. A girl from the kiln town asked whether her brother would come home, and Vaelisse saw the true answer and refused to say it pretty. She told her the road was still open, which was not the whole truth and was not a lie. The girl left a copper she did not have to spare. Vaelisse keeps it in the candle dish."
    ),
    s(
      "A name that wasn't in the rite",
      "During a blessing she says Soren's name where the rite asks for no one in particular. The room goes quiet in the way rooms do when a priest has slipped. She hears it. She leaves the name in, finishes the blessing, and later laughs under her breath where only the candle can hear. \"He would hate that,\" she tells the dark. She does not take it back."
    ),
  ],
  cael: [
    s(
      "The count",
      "Caelor comes back from a fight still numbering under his breath. He puts two fingers to his throat and will not sit until the pulse drops. Orien watches from the doorway and does not interrupt, because he has learned that looking away is the thing Caelor cannot forgive. When the number is low enough, Caelor notices him. \"Did you see the last step?\" Orien nods. Caelor nods back, once, like a man checking that the room is still there."
    ),
    s(
      "Eight-count",
      "Alone, he still runs his brother's drill: eight steps, a turn, the blade back to guard. His brother's name was Edrin. Caelor does not say it where anyone can use it. When he gets the count right he looks annoyed, as if the dead have no business being easy to remember, and he runs it again. Soren, bandaging a different man on the step, hears the eighth step land and does not comment. The not-commenting is the kindness."
    ),
    s(
      "Don't look away",
      "He tells Orien the hard part of fire is not the lighting. It is staying long enough to see what it costs. A village is standing because he burned the field in front of it. Edrin was in the mill he thought was empty. Caelor stays on the black grass until he has finished saying that, and he makes Orien stay too. \"If you train with me,\" he says, \"you don't get to blink.\""
    ),
  ],
  ivo: [
    s(
      "While they are still talking",
      "Ivelisse edits a sentence while the speaker is still in it, then reads the better line back quieter, as an offer rather than a correction. Kithra, carrying the water and pretending not to listen, mouths the new version and gets it right. Ivelisse sees. She does not praise the mimicry. She slides the page across. \"The second label on your bottle is a guess,\" she says. \"This one isn't. Fix the bottle.\""
    ),
    s(
      "The unsent",
      "She writes letters and does not send them. The formal address is often scratched out and replaced with a first name: Soren, Vaelisse, once Caelor, which she abandons after three lines because he would answer as if it were a challenge. If anyone sees the page she goes pink and talks about the weather of the ink. The letters are how she looks after people when her mouth is too precise to be kind out loud."
    ),
    s(
      "Ask first",
      "At court, nobody asked before they read a private line aloud. That was the day she left with the page they wanted burned. Now, when a bond story or a confession lands on her table, she puts the pen down and asks. Soren brings her the ring-note because he knows she will ask. She does. Then she ruins their sentence on purpose, and she tells him she is doing it."
    ),
  ],
  rhys: [
    s(
      "The second pass",
      "Rhyskar checks the doors twice. The first pass is for the report. The second is slower, a hand on each latch, and it never gets written down. Bastior, who ran a keep by lists, watches the second pass and understands it at once. \"You lost people to a door,\" Bastior says. Rhyskar shakes his head. \"I lost them to an order. The door was just where I was standing.\" He checks the latch again."
    ),
    s(
      "Weather",
      "He fixes his own collar and stands very still while he does it, as if the armor needs a moment to agree. Outside is rain he has decided his people do not have to stand in. Pavellen comes in shaking water off a mason's shoulders and finds a dry square of floor already cleared. Rhyskar does not mention the clearing. The collar takes all of his attention, which is how he gets away with the rest."
    ),
    s(
      "Without the plate",
      "Armor off, he is a man with a bruised knuckle and a laugh that surprises him every time. He asked one person to keep that private. He still hopes they did. The laugh gets out anyway when Lenara tells him to sit and he sits on the wrong bench, like a knight who has forgotten furniture. She does not write it down. He looks at her as if she has done him a mercy, and she has."
    ),
  ],
  juniper: [
    s(
      "Past comfort",
      "Ysmerra holds a note past the point of comfort and grins when it finally breaks. On the hills where she learned, stopping early meant the singer was afraid, and afraid singers got people lost in weather. Maelor, who can take the air out of a charge, listens from the ridge and does not steal this wind. When she is done he says, \"That one would have arrived on time.\" She takes it as the compliment it is."
    ),
    s(
      "The wrong tea",
      "She makes tea the way her mother told her not to, too strong, a little bitter, and drinks the first cup herself before she offers the pot. The disobedience is the point. She gives the second cup to Kithra, who has been carrying bottles with guessed labels all day. \"If it's awful, it's mine,\" Ysmerra says. Kithra drinks. It is awful. She stays for another cup anyway."
    ),
    s(
      "In tune",
      "Ysmerra can hum a person's speaking voice back in tune. She does it once for Remira, who has spent years in the back of other people's companies, and Remira goes quiet in a way that is not anger. \"That's my name-shape,\" Remira says, which is not a sentence Ysmerra expected. Ysmerra is always a little surprised she kept a voice. She is more surprised anyone wanted theirs returned."
    ),
  ],
  marek: [
    s(
      "Two fingers",
      "Marrec moves people back from a furnace with two fingers on the wrist, the way his father moved him when the glass was ready to slump. Then he stays inside the distance he just cleared. Caelor watches this and hates it, because it looks like a man choosing the fire. \"I pull them out,\" Marrec says. \"I just don't leave with them.\" Caelor does not blink. Marrec, for once, looks away first."
    ),
    s(
      "Behind the ear",
      "Someone hands him wildflowers as a joke, the cinder adept crowned in something that will wilt. He tucks them behind his ear and waits for the laugh to finish. The laugh finishes. The flowers stay until the petals warm against his skin. He does not know how to put them down without making a speech. Orien, who also does not know what to do with flowers, recognizes the problem and says nothing useful. It helps."
    ),
    s(
      "After the flare",
      "When the fire dies he gets shy. He asks if he overdid it, and he is not talking about the fire. The person he pulled back is coughing and alive. Marrec stands at the edge of his own scorch mark like a guest. \"You can come away from it,\" the pulled person says. He does, one step, which for him is a crossing. The flowers are ash by then. He doesn't mention them."
    ),
  ],
  theo: [
    s(
      "The count on the back",
      "Theara puts a hand between a frightened person's shoulder blades and counts a slow rest until the shoulders drop. On the boat, that was how the crew kept a sailor from climbing the wrong rail. She uses it on land without announcing the method. Nycor, who trusts currents more than speeches, lets her count him after a bad ford and pretends he is only being polite. His breathing changes anyway. She notices. She always notices."
    ),
    s(
      "Something soft in the net",
      "She keeps old letters and underlines the kind sentences. \"A net needs something soft in it,\" she tells Soren, \"or the catch tears.\" He is holding a ring he was ordered to return and looks at her like she has described his whole problem in tackle. She underlines nothing on him. She just leaves the letters where he will see that other people kept the gentle lines."
    ),
    s(
      "As far as the water",
      "After a bad night she walks as far as the water and does not talk. The crew she grew up with learned to let her. Lenara, who makes shaking fighters sit, walks half the distance and then sits on the stones so Theara can have the rest of the shore. They do not discuss the arrangement. In the morning Theara brings her tea that is not a speech. Lenara drinks it."
    ),
  ],
  bastion: [
    s(
      "Closer than the plan",
      "Bastior marks where people should stand. The marks end up closer together than the plan says. In the keep, distance was how he lost them: he was in the stores, counting, and the wall was already gone. Rhyskar looks at the tight cluster and moves his own mark one step in without being asked. Bastior sees it and has to stare at his list until his eyes behave. \"The count can wait,\" Rhyskar says. It is the first order Bastior has obeyed in years."
    ),
    s(
      "Have you eaten",
      "He stops giving orders in the middle of a sentence. The next question is whether anyone has eaten, and he waits for a real answer, not a nod. Pavellen, who will work a dark site until someone drags him, admits he has not. Bastior produces bread from a pocket that was supposed to hold a key. \"Lists keep people alive,\" he says, almost apologizing. \"Bread too. I forgot which one I was holding.\""
    ),
    s(
      "The watch he doesn't send",
      "He could send the next watch out. The schedule says so. Sometimes he does not. He puts a hand on a shoulder and waits to see if that person will stay in the room instead. The night the keep fell, nobody stayed because he had not asked. He asks now. It is an unscheduled item. He writes it at the bottom of the page, under the numbers, where a clerk would scold him. He leaves it there."
    ),
  ],
  niles: [
    s(
      "Until it sounds like a person",
      "Nylas makes a student repeat a vow until it sounds like a person and not a formula. When it finally does, he forgets to tell them to stop, and the student says it once more, smaller, meaning it. He was harder on fake oracles than this. He is harder on himself. Vaelisse, who left a temple for refusing to lie, listens from the door and does not offer a prettier version. \"That one will hold,\" she says. He writes it down as spoken, not as improved."
    ),
    s(
      "One true sentence",
      "He slides a letter across the table. One sentence is circled. \"That one is true,\" he says. He does not say he wrote it. The letter is to a family whose oracle had been selling them comfort. The circled line is an apology with a date and no decoration. Ivelisse would have fixed the grammar. He asks her not to. She puts the pen down, which is her way of agreeing."
    ),
    s(
      "Off the record",
      "He is gentle when he is checking whether someone is lying. The gentleness surprises people who came to be exposed. He says that part of the work does not go in the archive. A night warden, Silavar, asks him whether a toll house is still owed a debt of walking. Nylas listens to the boots, not the claim. \"You're not lying,\" he says. \"You're just not finished.\" He does not file it."
    ),
  ],
  orien: [
    s(
      "Where Caelor can't hear",
      "Orien practices the last step of the drill where he thinks Caelor will not hear him. The yard is empty until it isn't. Caelor is in the shadow of the gate, and he has been there for the ugly middle of the set, not just the clean ending. Orien's ears go red. He finishes anyway. \"Did it land?\" he asks, which is the only question he trusts. Caelor says, \"Again.\" It is permission and a critique, and Orien takes both."
    ),
    s(
      "Like a weapon",
      "He does not know what to do with wildflowers, so he holds them the way he holds a blade he is afraid to drop. Marrec, who wore a bunch behind his ear until it warmed, sees the panic and does not laugh. \"Pocket,\" Marrec says. \"They survive a pocket.\" Orien puts them away. Later there is a yellow stain on his lining. He looks pleased and will not explain it. Caelor notices the stain and, mercifully, talks about footwork."
    ),
    s(
      "In ink",
      "He writes names in a drill book in pencil, then inks them if the person is still around the next day. There is often ink on his hand. Edrin's name is not in the book. Caelor has never asked him to write it, and Orien is not sure he has the right. He leaves a blank line at the top of the first page anyway, the way you leave a chair. Some nights he almost fills it in. He doesn't. The blank is the respectful version."
    ),
  ],
  kit: [
    s(
      "The label she fixes",
      "Kithra mislabels a reagent and catches it before anyone shouts. She rewrites the tag in small letters, hoping the fix will be louder than the mistake. Ivelisse, who corrects people when she cares, reads the new label and nods once. \"Two of them were guesses,\" Kithra says, because honesty has gotten into her. \"This one isn't anymore.\" Ivelisse says, \"Then the bottle can stay.\" It is the first time the job has sounded like hers."
    ),
    s(
      "Out loud, twice",
      "Someone writes her a kind letter. She does not believe it until she reads it aloud to herself a second time, alone, in the stairwell where she used to wait with other people's coats. The letter says she hits harder than a water-carrier needs to, and that the water was never the small part. She folds it crooked. Ysmerra hears the second reading through the wall and hums the speaking voice back, gently, so Kithra will know it landed outside her own head."
    ),
    s(
      "Already sorted",
      "She waits by the door with everyone's coats in the order they will leave. She pretends this is not the part of the night she likes. Rhyskar's is on top because he checks the latches and will be last, which means his coat should be easiest to find when he is tired. He notices. \"You don't have to,\" he says. She says, \"I know.\" She does it anyway, and the knowing is what makes it a gift."
    ),
  ],
  pavel: [
    s(
      "Already part of the wall",
      "Pavellen sets a brace where someone is about to stumble and pretends it was part of the wall. His father taught him that a good repair should look like it was always there. Bastior, who believes in visible lists, wants the brace noted. Pavellen refuses. \"If they see the prop, they lean wrong.\" Bastior argues, then watches a runner take the corner without thinking. The runner lives. Bastior adds a line to the list that only says, \"Leave his braces alone.\""
    ),
    s(
      "Would have been rubble",
      "A relic from a torn-down shrine ends up in someone else's bag. Pavellen says it would have been thrown out with the broken coping. His ears go hot, which disagrees with the casual voice. The someone is Adelune, who can make a room feel safe and prefers to say so first. \"I'm not stealing it,\" she says. \"I'm walking it out before the crew buries it.\" He lets the bag go. Later he asks if it cracked. It didn't. He sleeps."
    ),
    s(
      "After the crew",
      "Everyone else has gone home. He still walks the dark worksite. He calls it a courtesy. Osriand meets him on the second landing with an extra lamp already lit, because Osriand counts steps for people who will not admit the dark is a problem. Pavellen takes the lamp and does not confess anything. They walk the braces together. In the morning the wall looks like it was always going to stand. That is the courtesy."
    ),
  ],
  len: [
    s(
      "Sit",
      "Lenara tells a fighter the next watch is soon, then makes them sit. Their hands were shaking. Making people sit used to be her whole job with the sellswords, the one they mocked until they needed it. Remira, who was hired to stay in the back of that same kind of company, sits without being told and looks surprised at herself. \"Your hands,\" Lenara says. Remira looks. They are shaking. She stays down."
    ),
    s(
      "The wrong captain",
      "Wildflowers meant for a captain end up beside a wounded scout. The card is in Lenara's handwriting. She will not discuss the rerouting except to say the captain had two hands that worked. The scout reads the card three times. Soren, clumsy with his own kindness, sees the move and recognizes a cleaner version of what he is trying to learn. He does not applaud. She would have hated that. He reties a bandage instead, and gets it right."
    ),
    s(
      "One stolen minute",
      "She holds a door with her foot and steals a quiet minute for whoever is on the other side of it. The hall wants them back. The minute is not on any schedule Bastior would approve, so she doesn't tell him. Inside, Theara is counting breaths for a sailor who came inland and forgot how. Lenara keeps the door. When the shoulders drop, she lets the hall have them. Not before."
    ),
  ],
  remy: [
    s(
      "Long enough to be seen",
      "Remira was paid to pass behind the named fighters and stay forgotten. She stops once, in the middle of the line, long enough that they have to look at her. The contract did not include her name. She says it anyway. One of the named fighters is Brynnael, who refused to throw a match and has been on the road since. Brynnael looks, nods, and shifts half a step so Remira is no longer behind anyone. Remira seems surprised it worked. She does not step back."
    ),
    s(
      "One sentence",
      "She keeps a single letter in her jacket. It is one sentence, and it has her name in it. \"That's plenty,\" she tells Ysmerra, \"if the sentence is right.\" Ysmerra, who gives people their voices back in tune, asks to hear it. Remira reads it without performing. The sentence is from a dead company that finally used the name on a pay chit they never issued. She did not cash it. She kept the line."
    ),
    s(
      "Under the work lamp",
      "When the named fighters leave, she stays under the work lamp and spars alone. Orien finds her there and almost leaves, because he understands practicing where you hope you are unheard. He stays. They do not talk about Caelor or contracts. They trade one step each. Hers lands. She laughs once, short, like a person trying on a sound. The lamp smokes. Neither of them puts it out."
    ),
  ],
  nera: [
    s(
      "The bundle that fell",
      "Nerathiel hangs herbs where the wind can reach them. If a bundle falls, she ties it again and does not scold the hill. \"It doesn't get a day off,\" she says, which is also what she tells herself. Selenya, coming up from a bitter well, trades a cup of clean water for a sprig and stays to retie two knots the wind will only undo. They work without making it a visit. The hill smells like medicine and rain. Travelers find the porch by that."
    ),
    s(
      "Downhill",
      "A lord's man asks her to poison a rival's horse. She looks at his boots, which are wrong for the slope, and sends him downhill with a wrapped sprain and no directions back. He shouts from the switchback. She does not answer. Harrovan later finds the incident missing from the burn ledger, because it was not a fire, and from the court book, because she never wrote it down. He adds a private line: \"She said no.\" He does not sign her name to it."
    ),
    s(
      "In case someone knocks",
      "She boils water before she sleeps, in case someone knocks. Most nights nobody does. She boils it anyway. On the night someone does, it is Tessalyne with a kit that is one roll short and a patient who will not sit. Nerathiel points at the stool. The water is already hot. Tessalyne's shoulders drop in a way she usually has to order out of other people. \"Sit yourself,\" Nerathiel says, not unkindly. \"The cut can wait until you breathe.\""
    ),
  ],
  silas: [
    s(
      "The last page",
      "The toll book still has Silavar's name on the last page. The house stopped paying him and kept the road. He left the book. He kept the route. Nylas asked him once whether that was a debt or a grudge, and Silavar said, \"It's a walk.\" He still does it. Things in the dark got used to his lamp, which is not the same as trusting him. He prefers it that way. A trusted warden gets lied to."
    ),
    s(
      "The cracked pane",
      "He carries a lamp with a cracked pane. He could replace it. A whole pane, he says, hides the road: you see your own light and nothing past it. Osriand, who carries lamps for other people and counts landings, offers him a sound one from the tower. Silavar refuses and then walks Osriand to the top anyway, because the offer was kind and the dark on those stairs is a different dark. He leaves the cracked lamp burning at the bottom so the way back exists."
    ),
    s(
      "By the boots",
      "He can tell who is on the road by how their boots hit. Doriath walks like a man who does not want the ground to remember him. Silavar steps aside for that rhythm and does not announce it. Once he doesn't step aside, because the rhythm is wrong, too heavy, a stranger wearing a careful man's hour. He lifts the lamp. The stranger stops. Silavar says, \"If you can hear me, you waited too long.\" It is not a threat. It is a direction. The stranger takes it."
    ),
  ],
  maris: [
    s(
      "The rope",
      "Mariselle told the town the water would take the lower dock. They loaded the boat anyway, because the fare was already paid and the night looked ordinary. She still hears the rope snap. She does not tell the story as a lesson if she can help it. Nycor, who closes the ford when the water goes white, is one of the few who gets the version with the sound in it. He says, \"I would have argued with them too.\" She says, \"I did.\" The river keeps the last word, which is why she hates it and will not leave it."
    ),
    s(
      "What a person can carry",
      "She charges what a person can carry, not what a ledger says. Soldiers pay double. Children pay nothing. A clerk from a house that likes numbers tries to straighten her box. She puts his coin back in his hand and his hand back on the rail. \"The crossing has a price,\" she says. \"I set it.\" Ilythra, who once took a flower instead of a town's gold, rides without paying and leaves the flower on the fare box. Mariselle doesn't press it flat. She lets it ride one crossing and then another."
    ),
    s(
      "At the bow",
      "The night crossing is slower. She stands at the bow and does not talk. The river is loud enough. Passengers who need a voice get Theara, if Theara is aboard, counting breaths for anyone who has decided the water is a mouth. Mariselle keeps the tiller honest and the lamp low. When they strike the far mud she says, \"Off.\" It sounds like rudeness. It is the gentlest version of goodbye she has left."
    ),
  ],
  rowan: [
    s(
      "Chalk on the lintel",
      "Rovann writes the date on the lintel each morning. If the chalk is gone, someone came through in the dark and touched the post on their way. He does not mind the touching. He minds not knowing the direction. Harreth once held a bridge until the stone remembered him. Rovann's post is smaller and just as stubborn. When Harreth climbs the pass he rubs the chalk with a thumb, on purpose, and writes the date himself underneath. Rovann allows it. The road is a conversation if you let the lintel speak."
    ),
    s(
      "Still open",
      "A sister was due down the pass and never arrived. He does not say she is dead. He says the road is still open, and he has been saying it long enough that the sentence has become a post of its own. Vaelisse, who will not give a flattering prophecy, stops asking him for a truer one. She lights her candle where he can see it from the high switchback. Some nights he answers with the lamp in the hut window. Neither of them pretends this is news of the sister. It is news that someone is still waiting without lying about the wait."
    ),
    s(
      "The reason for the shield",
      "He plants his shield and lets the hit land. The people behind him are the reason the shield is there. He tells Idrisul this when the younger man, Harreth's nephew in all but the paperwork, tries to make the stand look like glory. \"Glory is a story for people who were not behind the shield,\" Rovann says. Idrisul resets his feet, less pretty, more useful. A family gets through. Rovann counts them, the way he counts everyone who comes back down. The number goes up by four. He sleeps."
    ),
  ],
  selene: [
    s(
      "Last, on purpose",
      "Selenya boiled the well twice a day and still made people taste it before she did. She got sick last, on purpose. The river had turned bitter and the town wanted a verdict more than a method. She gave them the method. Ilythra, whose own well should have gone dry and didn't, comes to compare water and stays to haul buckets. \"You don't have to drink last,\" Ilythra says. Selenya says, \"Yes I do. They watch the order.\" She drinks. She stays standing. The town exhales."
    ),
    s(
      "Notches",
      "She scratches a notch for every person who drinks and walks away. The cup is almost full of marks. Nerathiel says a hill clinic counts differently, by who comes back able to leave. Selenya likes that and does not change her cup. One notch is deeper than the others. She will not say whose. If you ask, she hands you water first. \"Drink. Then tell me what hurts.\" The order is the whole ethic. She will not reverse it to satisfy a story."
    ),
    s(
      "How she knows it's holding",
      "When the work is done she sits by the water and does not talk. The quiet is how she knows the well is holding. If it were failing she would still be boiling. Garric, who keeps cloth ready and talks too much when he is frightened, sits near her and manages, for once, to match the quiet. She passes him the notched cup, empty. He understands it is not a request for a performance. He rinses his hands. The well sounds like a well. They both listen until it is only that."
    ),
  ],
  dorian: [
    s(
      "The name he will not say",
      "Doriath walked a witness to the ford and did not take the court's coin. He still will not say the witness's name. Mariselle took them across after dark and charged a soldier's price to the court in absentia, which is to say she charged Doriath nothing and the idea of the court double. He left a knife he did not need on her fare box and took it back when she glared. \"I say who I work for,\" he tells her. \"I don't say who I worked for once.\" She nods. The river does not need the name."
    ),
    s(
      "A loud knife",
      "He practices the same draw until the motion is quiet. A loud knife, he says, is a failed knife. Silavar hears the practice from the road and cannot hear it, which is the point, and steps aside for the rhythm anyway. They do not become friends. They become accurate about each other. \"You walk like you pay a toll you aren't charged,\" Doriath says. Silavar says, \"You cut like you want the ground to forget you.\" Both of them are right. Neither of them performs the observation twice."
    ),
    s(
      "Knock once",
      "He eats late and leaves the lamp on. People who need him know to knock once. Twice is a stranger or a court. Vaelisse knocks once, after dark, because that is when she talks more easily, and she is not hiring him. She has a name she let slip in a rite and wants to know if a man like him would be angry to be spoken aloud. He thinks about it. \"Say it if you mean it,\" he says. \"Don't sell it.\" She laughs, small. The lamp stays on after she leaves."
    ),
  ],
  brynn: [
    s(
      "The purse unopened",
      "Brynnael was paid to fall in the third pass. She put the sponsor's man on his back and walked out with the purse unopened. The road started there. Remira, years later, hears the story and recognizes the moment of stopping long enough to be seen. \"Did they use your name after?\" Remira asks. \"They used it to bar me,\" Brynnael says. \"That's still my name. I'll take it.\" She spends the unopened purse on food for a line of fighters who were told to lose something smaller. She tells them the price."
    ),
    s(
      "The line in the dirt",
      "She marks a line in the dirt and will not cross it until she chooses. Students copy the line. She lets them. Orien copies it too neatly, a squire's line, and she scuffs it wider. \"Caelor's steps are for Caelor's ghost,\" she says, not cruelly. \"Yours have to fit your feet.\" Orien redraws it worse, which is better. She steps in when he is ready and not before. \"I'll meet you there,\" she says. She does."
    ),
    s(
      "The ones who ask how",
      "Fighters she beat still write. She answers the ones who ask how, and ignores the ones who ask her to come back and fall correctly this time. Liravel writes a letter that is mostly footwork and one question about fear. Brynnael answers the footwork in detail and the fear in a sentence: \"Step in anyway.\" She does not sign a school name. She signs Brynnael. The road can carry that much."
    ),
  ],
  harrow: [
    s(
      "No skipped lines",
      "Each page of Harrovan's ledger is a street, a name, and whether the house stood. He does not skip a line to make the month look better. The office hated him for this and still uses the books. When he started setting the controlled burns himself, the pages got soot on them. He does not recopy them clean. Willoweft, who writes hexes in a hand as careful as his, reads a sooty page and says, \"The stain is part of the count.\" He could kiss her for that. He offers her tea instead. She accepts. The ledger stays dirty and true."
    ),
    s(
      "Until it dies",
      "He lights the break and stays until the fire dies. Leaving early is how the last clerk lost the west row. Marrec, who stays inside the distance he clears for other people, recognizes the vigil and hates sharing it. They stand on opposite ends of the same black line. \"You file it,\" Marrec says. \"I feel it.\" Harrovan says, \"I feel it and then I file it, so the next street gets a warning instead of a speech.\" The fire dies. They are both still there. That is the whole truce."
    ),
    s(
      "Behind, and paying",
      "He pays the families from his own purse when the office will not. He is behind. He keeps paying. A kiln-town mother refuses the third coin and asks him to write her son's name with the spelling he used, not the office's. He does. The line takes longer than the coin would have. He walks home lighter and poorer, which he has decided is the correct weight for a clerk who lights fires."
    ),
  ],
  osric: [
    s(
      "The sagging step",
      "Osriand knows which step sags on every flight. He says it out loud so the person behind him does not have to find it with their weight. He learned the tower by counting because the dark does not bother him and the people do. Pavellen, proud of walking his own sites, misses a sag and is caught at the elbow before the curse. \"Hold the lamp,\" Osriand says. \"I'll take the next one.\" Pavellen holds it. The next landing is kinder. Neither of them calls the catch a rescue."
    ),
    s(
      "One more than asked",
      "He lights one more lamp than he was asked for and leaves it. In the morning it is usually still burning, which means someone needed the extra and did not have to ask. Silavar's cracked lamp is a different philosophy. They argue, mildly, at the tower door. Osriand wants the dark solved. Silavar wants the road visible past the glare. They compromise: a low lamp at the foot, a bright one at the turn. In the morning both are out. Someone used them. Osriand is satisfied. Silavar is unsurprised."
    ),
    s(
      "Weather, not the dark",
      "He talks about the weather, not the dark. People make it to the top. That is the job. A frightened clerk from Harrovan's old office climbs beside him reciting numbers to stay brave. Osriand talks about rain on the west windows until the numbers fade. At the top the clerk cries, briefly, and apologizes. \"Weather does that,\" Osriand says, which is a kindness so dry it takes a second to land. The clerk laughs. The laugh gets them back down."
    ),
  ],
  tessa: [
    s(
      "The same night",
      "Rolls of cloth, a needle, a tin of salve. Tessalyne replaces what she uses the same night, even when her hands want to be done. The road crew left her a wagon and a note. She sold the wagon and bought more cloth. Nerathiel sees the tin and the pride and makes her sit before the kettle. \"Bleeding can wait one breath,\" Tessalyne says, quoting herself, annoyed to be on the other side of it. \"Not two,\" Nerathiel answers, and takes the second breath away by starting the tea."
    ),
    s(
      "Count with me",
      "She makes the wounded count with her before she starts. The count keeps their eyes open. Garric, who keeps field cloth and panics into chatter, counts too fast. She taps his wrist until he matches her. A soldier who has decided he is finished watches the tap and starts the count without being recruited. He stays conscious. After, Garric says, \"You could teach that.\" She says, \"I just did.\" She packs the kit before she eats."
    ),
    s(
      "More cloth",
      "The note from the crew said they would send for her when the next contract opened. She did not wait, and she did not follow. The wagon money is cloth now, stacked where a person can find it in the dark. Zenovar, a flare-healer who still believes speed is a kind of mercy, tries to borrow a roll and put it back later. She makes him take two and write his name on the slate. \"Later is how kits go empty,\" she says. He writes. He brings four back. She allows herself to look pleased."
    ),
  ],
  nico: [
    s(
      "The near post",
      "Nycor ties a rope to the near post before he steps into the ford. He has pulled two people out with it, and himself once. The current does half the work. He does the rest, and he does not romanticize the half that tried to keep him. Mariselle respects the rope more than she respects most speeches. \"You close it when it goes white,\" she says. \"Good.\" He says, \"You charge soldiers double. Also good.\" They are, briefly, colleagues. The ford shines between them, ordinary and fatal."
    ),
    s(
      "Before dusk",
      "He eats what he spears and salts the extra. Neighbors know to come by before dusk, after which he is a rumor with a lamp. Theara grew up on a boat and understands a pantry that is also a duty. She underlines nothing. She takes a salted fish and leaves a mended net needle. He finds it and knows the hand. Next dusk there is a second portion set aside without a note. She takes it. The exchange runs for a week before either of them calls it neighborly, and then only by accident."
    ),
    s(
      "When it goes white",
      "He can read the ford by the color. When it goes white he closes the path and argues with anyone who wants to cross. A merchant offers money. Nycor points at the rope, then at the color, then at the merchant's dry boots. \"The current does not take bribes,\" he says. Isolune, who fights like a second current, backs him without being asked and looks delighted to have a rule this simple. The merchant waits until morning. The morning is brown water, crossable, cheap. Nycor charges nothing for the waiting. The lesson was the fee."
    ),
  ],
  adel: [
    s(
      "She says so first",
      "Adelune can make a room feel smaller and safer. She says so before she does it. The trick still works, which interests her more than a hidden one would. A frightened person at a door needs the room to shrink. She tells them: \"I'm going to make this feel easier than it is. You can refuse.\" They don't refuse. She angles a mirror, lowers her voice, and walks them through. On the other side she says, \"That was me. The door was always a door.\" They thank her for the honesty more than the trick."
    ),
    s(
      "The seam",
      "She keeps a cracked mirror because it shows the seam. She trusts the seam more than a perfect glass, which only shows what a theater wanted seen. Pavellen carried a shrine-relic out of a rubble pile and asked if it had cracked. She checked it beside her mirror. \"Crack's honest,\" she said. \"The glaze was the lie.\" He left it with her. She does not hang it. She wraps it where the seam can breathe. Some objects are not for looking into. They are for keeping."
    ),
    s(
      "Until they are through",
      "She walks people to the exit and stays until they are through it. Then she goes back for the next one. Osriand does this with stairs and lamps. They recognize the shape of the work and split a cold night without merging their methods. He talks about weather. She talks about what the room is doing. A shaking apprentice, Kithra, gets both: a true sentence about the door and a lamp that was not required. Kithra makes it outside. Adelune goes back in. The work is a loop. She chose it."
    ),
  ],
  solenne: [
    s(
      "She doesn't tell it twice",
      "Solenya walked back out of a burning gate with the lamp still lit. The mile should have taken her. The flame answered instead, and it has been answering at a cost she does not itemize. She tells Harreth once, because he held the bridge on the far side of that fire and deserves the version without ornaments. She does not tell it twice. When children ask, she lets them touch the warm metal and talks about wick-trim. Caelor, who also walked out of a fire he set, does not ask. She does not make him."
    ),
    s(
      "Which one first",
      "A child and a soldier. She will not say which she reached first. The soldier has never corrected the story, which is its own kindness. The child is grown now and leaves wildflowers where the gate was. Solenya takes one and gives the rest to Ilythra's well, because water should have the surplus and the lamp should stay light. People call her the last light. She calls herself a woman with a tool that still works. Both are true. Only one fits in her mouth."
    ),
    s(
      "Then it is dark again",
      "When she spends the lamp, the mile is brighter for one swing and then it is dark again. She prefers the dark to a flame that will not end. Harreth plants his shield in that after-dark and does not ask her to relight the world as a favor. \"Stand behind me,\" he says, an old line, and for once she does, because the lamp is tired and so is she. The road holds. In the morning she trims the wick as if it were any other chore. The flame comes back smaller. She approves of smaller."
    ),
  ],
  harren: [
    s(
      "He counted the living",
      "Harreth counted the people who crossed his bridge. He did not count the ones who tried to stop them. The stone remembered his name because he stood in one place longer than a story usually allows. Idrisul wants the glorious version. Harreth gives him the count instead: \"Forty-one across. I stopped looking at the other number.\" Idrisul repeats it until it sounds like a craft and not a legend. That is the inheritance. The shield is just the tool the craft required."
    ),
    s(
      "Mended, not replaced",
      "The shield split on the last night. He had it mended and did not replace it. A new shield would have been a claim that the night had not happened. Pavellen, who hides braces inside walls, understands and also disagrees. \"A lie that holds is still a hold,\" Pavellen says. Harreth says, \"This one holds and tells the truth.\" The crack is a bright line of newer metal. He turns that face toward the people behind him, not toward the hit. They can see what saved them. He can feel the old break and not perform it."
    ),
    s(
      "Still standing",
      "He puts the wall back up when it drops, and the people still standing find their breath at the same time, as if the shield lent them a lung. Seraphel, who sends them back in with a touch at the wrist, watches him do it with his whole body and says, \"You spend yourself to buy their second step.\" He says, \"That's the job.\" She says, \"Then let me buy you one.\" He allows a second step of his own, which is new. The bridge does not care. The people on it do."
    ),
  ],
  ilyra: [
    s(
      "For later",
      "Ilythra lowers the bucket even when the sky is clear. The water is for later. Her well should have gone dry a generation ago. It didn't, and she has stopped apologizing to geology. Selenya's bitter-town well needed boiling. Ilythra's needs remembering. She teaches Corivane, who carries banners and forgets to drink, to lower the bucket before he lifts the cloth. \"The banner can wait,\" she says. \"Your mouth can't.\" He drinks. The banner, afterward, hangs straighter, which he insists is unrelated."
    ),
    s(
      "A flower and a promise",
      "A town drank for a month and tried to pay her in coin. She took a flower and the promise to come back if the well sang wrong. They laughed, then they came back, and the promise was the real currency. Mariselle leaves her a flower on a ferry fare box in a private joke between women who refuse the ledger. Ilythra hears about it and sends a cup downstream with a corked note: \"Drink. Then hit harder than you did.\" Mariselle does not hit anyone. She does drink. The crossing that night is the calmest in a month."
    ),
    s(
      "Leave stronger",
      "People leave her stronger than they arrived. She is not mystical about it. She is specific: water, food, a sentence that is not a compliment so much as a direction. Quillen arrives with a banner he does not believe in and leaves believing in the drink, which is a start. \"Come back when the banner is heavy,\" she says. He does. She does not take it from him. She makes sure his hands can hold it. That is the whole spring."
    ),
  ],
  mael: [
    s(
      "Arrived at dawn",
      "A column that should have reached the ford by dusk arrived at dawn. Maelor was already gone. He had taken the air out of their hurry and left them walking inside a wind that did not love them. Nycor found their tracks at the white water and was glad they had been late. \"You'd have closed it anyway,\" Maelor says, when they finally meet. Nycor says, \"I'd have argued. You made the argument unnecessary.\" Maelor almost smiles. \"That's the work. They do not get the next step unless I allow it.\""
    ),
    s(
      "The missed swing",
      "He takes the air out of a swing. The person still standing is surprised they missed. Ysmerra, whose high note depends on a wind that stays, asks him not to practice that trick while she is singing. He doesn't. The restraint is a favor he would not give an army. After her note breaks on purpose, he says it would have arrived on time. She understands he means the song, not a battalion. It is the kindest thing a man who delays armies has said all season."
    ),
    s(
      "Already gone",
      "He does not stay to be thanked. Staying is how a controller becomes a target and a story. Nessira, who shares the old family wind and a second swing he pretends not to coach, catches him on the ridge anyway. \"You could teach me the late arrival,\" she says. \"You already swing twice,\" he says. \"Teach the second one to be quieter.\" She tries. The grass bows a moment late. He is gone before she can show him. She grins into the place he was."
    ),
  ],
  seraphine: [
    s(
      "The wrist",
      "Seraphel touched a fighter's wrist and the sword came back up. That was the whole trick, the first time. She has made it larger since, a second dawn for people who were told they were done. She is careful with it. Sending someone back in is a theft from something, even if she will not name the something. Harreth lets her buy him one step and no more. \"Again,\" she says, \"I am not finished with you.\" He answers, \"I am, after this.\" She honors the limit. The wrist-touch stays light."
    ),
    s(
      "The place they set",
      "The house she left still sets a place. She does not sit in it. Holt was a door and a table and a family that wanted her gift on a schedule. She sends bread by other hands and does not attach a letter. Elowynne, who also left a stone house and a name that wanted her smaller, understands the uneaten place. They talk about it once, sideways. \"Let them set it,\" Elowynne says. \"You don't have to be the meal.\" Seraphel laughs, startled. The laugh is the visit she could not make in person."
    ),
    s(
      "Twice, and then stop",
      "The people beside her swing twice, and then she makes them stop, because a third gift would start to look like a debt. Maevara already fights in pairs of cuts and does not need a third. Seraphel tells her so. \"Your second is yours,\" she says. \"I only return the one they stole.\" Maevara nods, relieved to be a craftswoman and not a miracle. They walk back toward the lamp at the end of the road. Seraphel does not promise it will stay lit. She promises the next step, if there is one, will be theirs to take."
    ),
  ],
};

Object.assign(BOND_STORIES, MORE_STORIES, REST_STORIES, ROSTER_STORIES);

export function applyBondStories(cast) {
  for (const unit of cast) {
    const rooms = BOND_STORIES[unit.id];
    if (rooms) unit.rooms = rooms;
  }
}
