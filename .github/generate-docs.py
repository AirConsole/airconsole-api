#!/usr/bin/env python
#
# Copyright 2024 N-Dream AG Inc.

import sys
import shutil
import re
import os

def normalizeChapter(chapter):
  chapter = chapter.title()
  while "  " in chapter:
    chapter = chapter.replace("  ", " ")
  return chapter

def getChapterID(chapter, i):
  chapter = normalizeChapter(chapter).replace(" ", "_")
  chapter = re.sub('[^0-9a-zA-Z_\-]+', '*', chapter)
  id = "jsdoc_chapters_%05d_%s" % (i, chapter)
  return id, "-" + chapter

def getChapterFromLine(line):
  if "@chapter" in line:
    return line.split("@chapter")[1].split("*")[0].strip()

filename = sys.argv[-1]
inputs = [filename]
output_dir = filename.split("/")[-1][:-3].replace(".", "-").replace(
    "airconsole", "api")
chapters = []
api = open(filename).readlines()
for line in api:
  chapter = getChapterFromLine(line)
  if chapter and chapter not in chapters:
    chapters.append(chapter)
os.mkdir("jsdoc_chapters")
temp_dir = "jsdoc_chapters"
try:
  replace_ids = []
  for i in range(len(chapters)):
    chapter = chapters[i]
    id, file_id = getChapterID(chapter, i)
    replace_ids.append((id, file_id, normalizeChapter(chapter)))
    path = temp_dir + "/" + id + ".js"
    active_chapter = None
    fp = open(path, "w")
    for line in api:
      line_chapter = getChapterFromLine(line)
      if line_chapter:
        active_chapter = line_chapter
      if "/**" in line and (active_chapter != None and active_chapter != chapter):
        line = "/** @ignore\n"
      line = line.replace("@typedef ", "@ignore ")
      line = line.replace("function AirConsole(","function AirConsole"  + id + "(")
      line = line.replace("AirConsole.", "AirConsole" + id + ".")
      fp.write(line)
    fp.close()
    inputs.append(path)
  cmd = "jsdoc " + " ".join(inputs) + " -d " + output_dir + " -t .github/minami_jsdoc_tmpl"
  os.popen(cmd).read()

  for file in os.listdir(output_dir):
    if not file.endswith(".html"):
      continue
    file = output_dir + "/" + file
    intermediate = open(file).readlines()
    os.remove(file)
    if "jsdoc_chapters_" in file and file.endswith(".js.html"):
      continue
    for id, file_id, chapter in replace_ids:
      file = file.replace(id, file_id)
    result = open(file, "w")
    for line in intermediate:
      for id, file_id, chapter in replace_ids:
        line = line.replace(">AirConsole" + id + "<", "><b>&#8627; " + chapter + "</b><")
        if "<h3>Classes</h3><ul><li>" not in line:
          line = line.replace(id, "")
          line = line.replace("jsdoc_chapters/.js", filename).replace("jsdoc_chapters_.js", filename.replace("/", "_"))
        line = line.replace("<h3>Classes</h3><ul><li><a href=\"AirConsole.html\">AirConsole</a><ul class='methods'>",
                            "<h3>Classes</h3><ul><li><a href=\"AirConsole.html\"><b>AirConsole</b></a><ul class='methods' style='display:none'>")
        if not file.endswith("AirConsole.html"):
          line = line.replace("<div class=\"container-overview\">", "<div style='display:none;'>")
        line = line.replace(id, file_id)
      result.write(line)
    result.close()


finally:
  shutil.rmtree(temp_dir)
  pass
