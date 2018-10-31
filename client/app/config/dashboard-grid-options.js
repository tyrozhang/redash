const dashboardGridOptions = {
  columns: 10, // grid columns count
  rowHeight: 50, // grid row height (incl. bottom padding)
  margins: 10, // widget margins
  mobileBreakPoint: 800,
  // defaults for widgets
  defaultSizeX: 3,
  defaultSizeY: 3,
  minSizeX: 1,
  maxSizeX: 10,
  minSizeY: 1,
  maxSizeY: 1000,
};

export default function init(ngModule) {
  ngModule.constant('dashboardGridOptions', dashboardGridOptions);
}
