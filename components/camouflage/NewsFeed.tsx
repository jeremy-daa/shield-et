"use client";

import React from "react";
import { Card, CardBody, CardFooter, Image, Button, Chip } from "@heroui/react";
import { articles } from "../../content/news/decoy";

export const NewsFeed = () => {
  return (
    <div className="pb-24">
       {/* Weather Widget Mock */}
       <a 
         href="https://weather.com/weather/today/l/ETXX0004:1:ET" 
         target="_blank" 
         rel="noopener noreferrer"
         className="block"
       >
         <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-6 rounded-3xl mb-8 text-white shadow-lg mx-4 mt-6 transform transition-transform active:scale-95">
             <div className="flex justify-between items-start">
                 <div>
                     <h2 className="text-3xl font-bold">72°</h2>
                     <p className="opacity-90">Partly Cloudy</p>
                 </div>
                 <div className="text-right">
                     <p className="font-medium">Addis Ababa</p>
                     <p className="text-sm opacity-75">H: 75° L: 65°</p>
                 </div>
             </div>
         </div>
       </a>

       <div className="space-y-6 px-4">
           {articles.map((article) => (
             <Card 
                key={article.id} 
                className="w-full bg-zinc-900/50 border-none shadow-none" 
                isPressable
                onPress={() => window.open(article.url, '_blank')}
             >
                <CardBody className="p-0 overflow-hidden rounded-xl">
                   <Image
                      alt={article.title}
                      className="w-full object-cover h-[200px]"
                      src={article.image}
                      width="100%"
                   />
                </CardBody>
                <CardFooter className="flex-col items-start px-2 pt-3 pb-1">
                   <div className="flex justify-between w-full mb-1">
                        <Chip size="sm" variant="flat" color="default" className="text-zinc-500 bg-zinc-800/50 text-[10px] h-5">{article.source}</Chip>
                        <span className="text-zinc-500 text-[10px]">{article.time}</span>
                   </div>
                   <h3 className="font-semibold text-lg leading-tight mb-1">{article.title}</h3>
                   <p className="text-zinc-400 text-sm line-clamp-2">{article.summary}</p>
                </CardFooter>
             </Card>
           ))}
       </div>
    </div>
  );
};
