import React from 'react';
import { react2angular } from 'react2angular';

import { PageHeader } from '@/components/PageHeader';
import { Paginator } from '@/components/Paginator';
import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';

import { wrap as itemsList, ControllerType } from '@/components/items-list/ItemsList';
import { ResourceItemsSource } from '@/components/items-list/classes/ItemsSource';
import { UrlStateStorage } from '@/components/items-list/classes/StateStorage';

import LoadingState from '@/components/items-list/components/LoadingState';
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, { Columns } from '@/components/items-list/components/ItemsTable';

import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import navigateTo from '@/services/navigateTo';
import { routesToAngularRoutes } from '@/lib/utils';

import QueriesListEmptyState from './QueriesListEmptyState';

import './queries-list.css';

class QueriesList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  sidebarMenu = [
    {
      key: 'all',
      href: 'queries',
      title: '所有查询',
    },
    {
      key: 'favorites',
      href: 'queries/favorites',
      title: '收藏夹',
      icon: () => <Sidebar.MenuIcon icon="fa fa-star" />,
    },
    {
      key: 'archive',
      href: 'queries/archive',
      title: '已归档的',
      icon: () => <Sidebar.MenuIcon icon="fa fa-archive" />,
    },
    {
      key: 'my',
      href: 'queries/my',
      title: '我的查询',
      icon: () => <Sidebar.ProfileImage user={currentUser} />,
      isAvailable: () => currentUser.hasPermission('create_query'),
    },
  ];

  listColumns = [
    Columns.favorites({ className: 'p-r-0' }),
    Columns.custom.sortable((text, item) => (
      <React.Fragment>
        <a className="table-main-title" href={'queries/' + item.id}>{ item.name }</a>
        <QueryTagsControl
          className="d-block"
          tags={item.tags}
          isDraft={item.is_draft}
          isArchived={item.is_archived}
        />
      </React.Fragment>
    ), {
      title: '名称',
      field: 'name',
      width: null,
    }),
    Columns.avatar({ field: 'user', className: 'p-l-0 p-r-0' }, name => `创建于 ${name}`),
    Columns.dateTime.sortable({ title: '创建时间', field: 'created_at' }),
    Columns.duration.sortable({ title: '运行时间', field: 'runtime' }),
    Columns.dateTime.sortable({ title: '最后执行', field: 'retrieved_at', orderByField: 'executed_at' }),
    Columns.custom.sortable(
      (text, item) => <SchedulePhrase schedule={item.schedule} isNew={item.isNew()} />,
      { title: '更新计划', field: 'schedule' },
    ),
  ];

  onTableRowClick = (event, item) => navigateTo('queries/' + item.id);

  renderSidebar() {
    const { controller } = this.props;
    return (
      <React.Fragment>
        <Sidebar.SearchInput
          placeholder="搜索查询..."
          value={controller.searchTerm}
          onChange={controller.updateSearch}
        />
        <Sidebar.Menu items={this.sidebarMenu} selected={controller.params.currentPage} />
        <Sidebar.Tags url="api/queries/tags" onChange={controller.updateSelectedTags} />
        <Sidebar.PageSizeSelect
          options={controller.pageSizeOptions}
          value={controller.itemsPerPage}
          onChange={itemsPerPage => controller.updatePagination({ itemsPerPage })}
        />
      </React.Fragment>
    );
  }

  render() {
    const sidebar = this.renderSidebar();
    const { controller } = this.props;
    return (
      <div className="container">
        <PageHeader title={controller.params.title} />
        <div className="row">
          <div className="col-md-3 list-control-t">{sidebar}</div>
          <div className="list-content col-md-9">
            {!controller.isLoaded && <LoadingState />}
            {
              controller.isLoaded && controller.isEmpty && (
                <QueriesListEmptyState
                  page={controller.params.currentPage}
                  searchTerm={controller.searchTerm}
                  selectedTags={controller.selectedTags}
                />
              )
            }
            {
              controller.isLoaded && !controller.isEmpty && (
                <div className="bg-white tiled table-responsive">
                  <ItemsTable
                    items={controller.pageItems}
                    columns={this.listColumns}
                    onRowClick={this.onTableRowClick}
                    orderByField={controller.orderByField}
                    orderByReverse={controller.orderByReverse}
                    toggleSorting={controller.toggleSorting}
                  />
                  <Paginator
                    totalCount={controller.totalItemsCount}
                    itemsPerPage={controller.itemsPerPage}
                    page={controller.page}
                    onChange={page => controller.updatePagination({ page })}
                  />
                </div>
              )
            }
          </div>
          <div className="col-md-3 list-control-r-b">{sidebar}</div>
        </div>
      </div>
    );
  }
}

export default function init(ngModule) {
  ngModule.component('pageQueriesList', react2angular(itemsList(
    QueriesList,
    new ResourceItemsSource({
      getResource({ params: { currentPage } }) {
        return {
          all: Query.query.bind(Query),
          my: Query.myQueries.bind(Query),
          favorites: Query.favorites.bind(Query),
          archive: Query.archive.bind(Query),
        }[currentPage];
      },
      getItemProcessor() {
        return (item => new Query(item));
      },
    }),
    new UrlStateStorage({ orderByField: 'created_at', orderByReverse: true }),
  )));

  return routesToAngularRoutes([
    {
      path: '/queries',
      title: '查询',
      key: 'all',
    },
    {
      path: '/queries/favorites',
      title: '收藏的查询',
      key: 'favorites',
    },
    {
      path: '/queries/archive',
      title: '归档的查询',
      key: 'archive',
    },
    {
      path: '/queries/my',
      title: '我的查询',
      key: 'my',
    },
  ], {
    reloadOnSearch: false,
    template: '<page-queries-list on-error="handleError"></page-queries-list>',
    controller($scope, $exceptionHandler) {
      'ngInject';

      $scope.handleError = $exceptionHandler;
    },
  });
}

init.init = true;
