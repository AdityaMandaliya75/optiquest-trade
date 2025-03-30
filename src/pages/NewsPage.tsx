
import React from 'react';
import Layout from '@/components/layout/Layout';
import NewsPanel from '@/components/news/NewsPanel';

const NewsPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Market News</h1>
        <NewsPanel />
      </div>
    </Layout>
  );
};

export default NewsPage;
