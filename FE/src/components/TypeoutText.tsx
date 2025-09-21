import {useState, useEffect} from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TypeOutText({ text, speed = 100, styles, delay = 0, segments=[] }: {text: string; speed?: number; styles: string, delay?: number, segments?: number[]}) {    
    const fullText = text;
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let currentIndex = 0;
        let timeoutId: ReturnType<typeof setTimeout>;
        let intervalId: ReturnType<typeof setInterval>;

        function typeNextChar() {
            setDisplayedText(fullText.slice(0, currentIndex + 1));
            currentIndex++;
            if (currentIndex === fullText.length) {
            clearInterval(intervalId);
            return;
            }
            if (segments.includes(currentIndex)) {
            clearInterval(intervalId);
            timeoutId = setTimeout(() => {
                intervalId = setInterval(typeNextChar, speed);
            }, 400);
            }
        }

        timeoutId = setTimeout(() => {
            intervalId = setInterval(typeNextChar, speed);
        }, delay);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div dir="rtl" className={styles}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayedText}
        </ReactMarkdown>
        </div>
    )
}