@echo off
rem ============================================================
rem Sauvegarde quotidienne du portfolio — lancee par le
rem Planificateur de taches Windows (tache « Portfolio Angelo -
rem sauvegarde quotidienne », tous les jours a 20:00).
rem
rem Pourquoi ce fichier :
rem   - le Planificateur ne trouve pas « python » ni « docker »
rem     (chemins absolus + PATH completes ici) ;
rem   - la sortie est conservee dans backups\_task.log pour
rem     diagnostiquer une execution reussie ou non.
rem
rem En cas de deplacement de Python/Docker : adapter les deux
rem lignes ci-dessous.
rem ============================================================
set PYTHONIOENCODING=utf-8
set PATH=%PATH%;C:\Users\PC\AppData\Local\Programs\DockerDesktop\resources\bin

cd /d D:\portfolio-angelo
"C:\Users\PC\AppData\Local\Programs\Python\Python314\python.exe" -X utf8 tools\backup.py > backups\_task.log 2>&1
exit /b %errorlevel%
