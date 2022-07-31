hexo.extend.filter.register('theme_inject', function(injects) {
  injects.bodyBegin.file('default', "./source/_inject/bodyBegin.ejs");
  injects.header.file('banner_video_insert_here', "./source/_inject/header.ejs", { key: 'value' }, -1);
});
