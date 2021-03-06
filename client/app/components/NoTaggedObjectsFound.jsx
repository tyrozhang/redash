import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { BigMessage } from '@/components/BigMessage';
import TagsControl from '@/components/tags-control/TagsControl';

function NoTaggedObjectsFound({ objectType, tags }) {
  return (
    <BigMessage icon="fa-tags">
      没有 {objectType} 收藏在&nbsp;<TagsControl className="inline-tags-control" tags={Array.from(tags)} />.
    </BigMessage>
  );
}

NoTaggedObjectsFound.propTypes = {
  objectType: PropTypes.string.isRequired,
  tags: PropTypes.objectOf(Set).isRequired,
};

export default function init(ngModule) {
  ngModule.component('noTaggedObjectsFound', react2angular(NoTaggedObjectsFound));
}

init.init = true;
