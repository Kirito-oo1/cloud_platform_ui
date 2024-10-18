const getters = {
  logsLen: (state) => state.logs.logsList.length || 0,
  tagList: (state) => state.tags.tagList,
  tagsKeep: (state, getters) => {
    return getters.tagList
      .filter((ele) => {
        return ele.meta.keepAlive;
      })
      .map((ele) => ele.value);
  },
};
export default getters;
