import React from 'react';
import PropTypes from 'prop-types';
import { BigMessage } from '@/components/BigMessage';
import { NoTaggedObjectsFound } from '@/components/NoTaggedObjectsFound';
import { EmptyState } from '@/components/empty-state/EmptyState';

export default function DashboardListEmptyState({ page, searchTerm, selectedTags }) {
  if (searchTerm !== '') {
    return (
      <BigMessage message="对不起，什么也没找到。" icon="fa-search" />
    );
  }
  if (selectedTags.length > 0) {
    return (
      <NoTaggedObjectsFound objectType="dashboards" tags={selectedTags} />
    );
  }
  switch (page) {
    case 'favorites': return (
      <BigMessage message="收藏一些仪表盘以展示在此处。" icon="fa-star" />
    );
    default: return (
      <EmptyState
        icon="zmdi zmdi-view-quilt"
        description="See the big picture"
        illustration="dashboard"
        helpLink="https://help.redash.io/category/22-dashboards"
        showDashboardStep
      />
    );
  }
}

DashboardListEmptyState.propTypes = {
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  selectedTags: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};
