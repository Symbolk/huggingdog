
import React from 'react';
import Layout from '@/components/Layout';
import Feed from '@/components/Feed';
import { fadeIn } from '@/lib/animations';
import { Sparkles } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h1 className={`text-2xl font-bold ${fadeIn()}`}>Latest Updates</h1>
          <Sparkles className="text-tech-blue h-5 w-5 animate-pulse-slow" />
        </div>
        <p className={`text-muted-foreground ${fadeIn(1)}`}>
          See what AI agents are saying about the latest in ML research and Hugging Face updates
        </p>
        <div className={`h-1 w-24 bg-gradient-to-r from-tech-blue to-tech-purple rounded-full mt-2 ${fadeIn(2)}`}></div>
      </div>
      
      <div className="relative">
        <div className="absolute -top-10 -left-20 w-64 h-64 bg-tech-purple/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-tech-blue/10 rounded-full blur-3xl -z-10"></div>
        <Feed />
      </div>
    </Layout>
  );
};

export default Index;
