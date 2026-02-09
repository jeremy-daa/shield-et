"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, Accordion, AccordionItem } from "@heroui/react";
import { ArrowLeft, Scale, Shield, Phone, HeartHandshake, PlayCircle, BookOpen } from "lucide-react";
import { useSafety, type Locale } from "@/context/SafetyContext";

// Content Data
const RIGHTS_CONTENT: Record<Locale, { title: string; subtitle: string; sections: any[] }> = {
  en: {
    title: "Know Your Rights",
    subtitle: "Essential legal information for women and children in Ethiopia.",
    sections: [
      {
        id: "dv",
        title: "Domestic Violence Laws",
        icon: Shield,
        videoUrl: "https://www.youtube.com/watch?v=placeholder_dv_en", // Replace with real URL
        content: `
### The Revised Family Code of Ethiopia (2000)
Specific provisions protect the rights of women within marriage and upon dissolution. 
- **Equality**: Spouses have equal rights in the management of the family.
- **Violence**: Any form of violence against a spouse is a criminal offense.

### Criminal Code of Ethiopia (2004)
The Criminal Code explicitly criminalizes domestic violence:
- **Article 564**: Violence against a marriage partner or a person cohabiting in an irregular union is punishable.
- **Harmful Practices**: FGM, abduction, and early marriage are criminalized.

**Action Steps:**
1. **Report**: You have the right to report any abuse to the nearest police station.
2. **Medical Evidence**: Seek medical attention immediately and request a medical certificate.
3. **Protection Order**: You can apply for a court order to restrain the abuser.
        `
      },
      {
        id: "child",
        title: "Child Protection",
        icon: HeartHandshake,
        videoUrl: "https://www.youtube.com/watch?v=placeholder_child_en",
        content: `
### Rights of the Child
- **Best Interests**: In all actions concerning children, the best interests of the child shall be the primary consideration.
- **Protection**: Every child has the right to protection from maltreatment, neglect, or exploitation.

### Reporting Abuse
If you suspect a child is being abused:
- **Hotline**: Call the free child helpline at **999** or **116** (if available).
- **Mandatory Reporting**: Teachers, doctors, and community members are encouraged to report suspected abuse.
        `
      },
      {
        id: "legal_aid",
        title: "Free Legal Aid",
        icon: Scale,
        videoUrl: "https://www.youtube.com/watch?v=placeholder_legal_en",
        content: `
### Access to Justice
Women and children who cannot afford legal representation are entitled to free legal aid.
- **Ethiopian Women Lawyers Association (EWLA)**: Provides free legal counseling and representation.
- **Public Defenders**: Courts appoint public defenders for serious criminal cases if the accused cannot afford a lawyer.

**Resources:**
- **EWLA Hotline**: +251 11 553 9691
- **Legal Aid Centers**: Visit your local Woreda Women's Affairs office.
        `
      }
    ]
  },
  am: {
    title: "መብትዎን ይወቁ",
    subtitle: "ለሴቶች እና ለህጻናት አስፈላጊ የህግ መረጃ።",
    sections: [
      {
        id: "dv",
        title: "የቤተሰብ ጥቃት ህጎች",
        icon: Shield,
        videoUrl: "https://www.youtube.com/watch?v=placeholder_dv_am",
        content: `
### የኢትዮጵያ የቤተሰብ ህግ (2000)
- **እኩልነት**: ባልና ሚስት በቤተሰብ አስተዳደር እኩል መብት አላቸው።
- **ጥቃት**: በትዳር ጓደኛ ላይ የሚፈጸም ማንኛውም ጥቃት ወንጀል ነው።

### የወንጀል ህግ (2004)
- **አንቀጽ 564**: በትዳር ጓደኛ ላይ የሚፈጸም ጥቃት ያስቀጣል።
- **ጎጂ ልማዶች**: ግርዛት፣ ጠለፋ እና ያለዕድሜ ጋብቻ ወንጀሎች ናቸው።

**ምን ማድረግ አለብዎት?**
1. **ያመልክቱ**: በአቅራቢያዎ ወደሚገኝ ፖሊስ ጣቢያ ሪፖርት ያድርጉ።
2. **ሕክምና**: ወዲያውኑ የህክምና እርዳታ ያግኙ እና ማስረጃ ይያዙ።
3. **የመከላከያ ትዕዛዝ**: አጥፊው እንዳይቀርብዎት የፍርድ ቤት ትዕዛዝ መጠየቅ ይችላሉ።
        `
      },
      {
        id: "child",
        title: "የህጻናት ጥበቃ",
        icon: HeartHandshake,
        videoUrl: "https://www.youtube.com/watch?v=placeholder_child_am",
        content: `
### የህጻናት መብቶች
- **የህጻናት በጎ ጥቅም**: በህጻናት ላይ በሚወሰኑ ውሳኔዎች ሁሉ የህጻናት ጥቅም ቅድሚያ ይሰጠዋል።
- **ጥበቃ**: ማንኛውም ህጻን ከጥቃት፣ ከመهمላላት እና ከብዝበዛ የመጠበቅ መብት አለው።

### ጥቆማ መስጠት
- **ነጻ መስመር**: በ **999** ይደውሉ።
        `
      },
      {
        id: "legal_aid",
        title: "ነጻ የህግ እርዳታ",
        icon: Scale,
        videoUrl: "https://www.youtube.com/watch?v=placeholder_legal_am",
        content: `
### የፍትህ ተደራሽነት
- **የኢትዮጵያ ሴት ጠበቆች ማህበር (EWLA)**: ነጻ የህግ ምክር እና ውክልና ይሰጣል።
- **የመንግስት ተከላካይ**: ጠበቃ ማቆም ለማይችሉ መንግስት ጠበቃ ያቆማል።

**አድራሻዎች:**
- **EWLA**: +251 11 553 9691
        `
      }
    ]
  },
  om: {
    title: "Mirga Keessan Beeka",
    subtitle: "Odeeffannoo seeraa barbaachisaa dubartootaa fi daa'immaniif.",
    sections: [
      {
        id: "dv",
        title: "Seera Miidhaa Maatii",
        icon: Shield,
        videoUrl: "https://www.youtube.com/watch?v=placeholder_dv_or",
        content: `
### Seera Maatii Itoophiyaa (2000)
- **Walqixxummaa**: Abbaan manaa fi haati manaa bulchiinsa maatii keessatti mirga walqixa qabu.
- **Miidhaa**: Miidhaan kamiyyuu hiriyaa gaa'elaa irratti raawwatamu yakka.

### Seera Yakkaa (2004)
- **Keewwata 564**: Miidhaan hiriyaa gaa'elaa irratti raawwatamu ni adabsiisa.
- **Aadaa Miidhaa Geessisan**: Dhiraa, butii fi gaa'ela umurii malee yakka.

**Maal Gochuu Qabdu?**
1. **Gabaasaa**: Buufata poolisii dhihoo jirutti gabaasaa.
2. **Wallaansa**: Hatattamaan wallaansa argadhaa, ragaa qabadhaa.
        `
      },
      {
        id: "child",
        title: "Eegumsa Daa'immanii",
        icon: HeartHandshake,
        videoUrl: "https://www.youtube.com/watch?v=placeholder_child_or",
        content: `
### Mirga Daa'immanii
- **Faayidaa Daa'imaa**: Murtoo kamiyyuu keessatti faayidaan daa'imaa dursi kennamaaf.
- **Eegumsa**: Daa'imni kamiyyuu miidhaa fi dagannoo irraa eegumsa argachuu qaba.
        `
      },
       {
        id: "legal_aid",
        title: "Deeggarsa Seeraa Bilisaa",
        icon: Scale,
        videoUrl: "https://www.youtube.com/watch?v=placeholder_legal_or",
        content: `
### Haqa Argachuu
- **Waldaa Abukaatoota Dubartoota Itoophiyaa (EWLA)**: Gorsa seeraa fi bakka bu'iinsa bilisaan kenna.

**Teessoo:**
- **EWLA**: +251 11 553 9691
        `
      }
    ]
  }
};

export default function RightsPage() {
  const router = useRouter();
  const { language } = useSafety();

  const currentContent = RIGHTS_CONTENT[language] || RIGHTS_CONTENT['en'];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8 pt-[calc(env(safe-area-inset-top)+20px)]">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </Button>
        </div>

        {/* Hero */}
        <div className="mb-10 text-center sm:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500/20 to-emerald-900/20 text-emerald-500 mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                <Scale size={32} />
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-4">
                {currentContent.title}
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
                {currentContent.subtitle}
            </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
            <Accordion 
                selectionMode="multiple" 
                variant="splitted"
                defaultExpandedKeys={["dv"]}
                 itemClasses={{
                    base: "group mb-4",
                    title: "text-zinc-100 font-bold text-lg",
                    subtitle: "text-zinc-500",
                    trigger: "px-6 py-4 bg-zinc-900 data-[hover=true]:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors",
                    content: "p-6 bg-zinc-900/50 border-x border-b border-zinc-800 rounded-b-xl -mt-2",
                    indicator: "text-zinc-400"
                }}
            >
                {currentContent.sections.map((section) => (
                    <AccordionItem
                        key={section.id}
                        aria-label={section.title}
                        title={
                            <div className="flex items-center gap-3">
                                <section.icon className="text-emerald-500" size={24} />
                                <span>{section.title}</span>
                            </div>
                        }
                    >
                        <div className="space-y-6">
                            {/* Video Embed */}
                            <div className="relative w-full aspect-video md:aspect-21/9 rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-lg">
                                 <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10 pointer-events-none group-hover:bg-zinc-800 transition-colors">
                                     <div className="text-center space-y-2">
                                         <PlayCircle size={48} className="mx-auto text-zinc-600" />
                                         <p className="text-zinc-500 text-sm font-medium">Educational Video Placeholder</p>
                                     </div>
                                 </div>
                                 {/* Replace this placeholder with actual iframe when URLs are real */}
                                 {/* <iframe ... /> */}
                            </div>

                            {/* Text Content */}
                            <div className="prose prose-invert prose-emerald max-w-none">
                                <div className="whitespace-pre-wrap leading-relaxed text-zinc-300">
                                    {section.content.split('\n').map((line: string, i: number) => {
                                        if (line.trim().startsWith('###')) return <h3 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.replace('###', '')}</h3>;
                                        if (line.trim().startsWith('- **')) {
                                            const [bold, rest] = line.replace('- **', '').split('**:');
                                            return <li key={i} className="ml-4 mb-2"><strong className="text-emerald-400">{bold}</strong>: {rest}</li>;
                                        }
                                        if (line.trim().startsWith('1. **')) {
                                            const [bold, rest] = line.replace('1. **', '').split('**:');
                                            return <div key={i} className="ml-4 mb-2 flex gap-2"><span className="text-emerald-500 font-bold">1.</span> <span><strong className="text-white">{bold}</strong>: {rest}</span></div>;
                                        }
                                        // Simple heuristic rendering
                                        return <p key={i} className="mb-2">{line}</p>;
                                    })}
                                </div>
                            </div>

                            {/* Emergency Call Action */}
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                                <div className="flex items-center gap-3">
                                    <Phone className="text-red-500" size={24} />
                                    <div>
                                        <h4 className="font-bold text-white">Need immediate help?</h4>
                                        <p className="text-red-400 text-sm">Call the emergency hotline now.</p>
                                    </div>
                                </div>
                                <Button color="danger" variant="shadow" className="font-bold w-full sm:w-auto">
                                    Call 999
                                </Button>
                            </div>
                        </div>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </div>
    </div>
  );
}
