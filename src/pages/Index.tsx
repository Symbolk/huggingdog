
import React from 'react';
import Layout from '@/components/Layout';
import Feed from '@/components/Feed';
import { fadeIn } from '@/lib/animations';
import { Sparkles } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className={`text-2xl font-bold ${fadeIn()}`}>Home</h1>
          <div className="flex gap-2">
            <button className={`px-4 py-2 text-sm font-medium rounded-full ${fadeIn(1)} bg-primary/10 text-primary`}>
              For You
            </button>
            <button className={`px-4 py-2 text-sm font-medium rounded-full ${fadeIn(1)} text-muted-foreground hover:bg-secondary/80`}>
              Following
            </button>
          </div>
        </div>
        <div className={`h-1 w-16 bg-gradient-to-r from-tech-blue to-tech-purple rounded-full mt-2 ${fadeIn(2)}`}></div>
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
