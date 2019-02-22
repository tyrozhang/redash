import React from 'react';
import PropTypes from 'prop-types';
import { BigMessage } from '@/components/BigMessage';
import { NoTaggedObjectsFound } from '@/components/NoTaggedObjectsFound';
import { EmptyState } from '@/components/empty-state/EmptyState';

export default function QueriesListEmptyState({ page, searchTerm, selectedTags }) {
  if (searchTerm !== '') {
    return (
      <BigMessage message="对不起，什么也没找到。" icon="fa-search" />
    );
  }
  if (selectedTags.length > 0) {
    return (
      <NoTaggedObjectsFound objectType="queries" tags={selectedTags} />
    );
  }
  switch (page) {
    case 'favorites': return (
      <BigMessage message="收藏的查询将会展示在这里。" icon="fa-star" />
    );
    case 'archive': return (
      <BigMessage message="归档的查询将会展示在这里。" icon="fa-archive" />
    );
    case 'my': return (
      <div className="tiled bg-white p-15">
        <a href="queries/new" className="btn btn-primary btn-sm">创建您的第一个查询</a>
        {' '}来填充我的查询列表。
      </div>
    );
    default: return (
      <EmptyState
        icon="fa fa-code"
        illustration="query"
        description="从数据源获取数据。"
        helpLink="https://help.redash.io/category/21-querying"
      />
    );
  }
}

QueriesListEmptyState.propTypes = {
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  selectedTags: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};
