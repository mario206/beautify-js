function n(r) {
  if (!mod_fire_fs.isDirSync(r)) {
    return false;
  }

  var t = mod_fire_path.basename(r);
  var o = mod_fire_path.dirname(r);
  var s = mod_fire_path.join(o, "project.json");
  return !("assets" !== t || !mod_fire_fs.existsSync(s)) || o !== r && n(o);
}


window.z = n;