function _n_Fun_($N_IN_0$) {
  if (!mod_fire_fs.isDirSync($N_IN_0$)) {
    return false;
  }

  var t = mod_fire_path.basename($N_IN_0$);
  var o = mod_fire_path.dirname($N_IN_0$);
  var s = mod_fire_path.join(o, "project.json");
  return !("assets" !== t || !mod_fire_fs.existsSync(s)) || o !== $N_IN_0$ && _n_Fun_(o);
}

window.z = _n_Fun_;