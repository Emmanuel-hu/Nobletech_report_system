@echo off
setlocal
cd /d "C:\Users\NOBLETECH ACADEMY\Documents\nobletech Academy details\nobletech-education-management-platform"
"C:\Progra~1\nodejs\npm.cmd" run -w backend typecheck > "artifacts\phase2k-validation-20260713-r2\backend_typecheck_rerun2.out.log" 2> "artifacts\phase2k-validation-20260713-r2\backend_typecheck_rerun2.err.log"
echo EXITCODE:%errorlevel%> "artifacts\phase2k-validation-20260713-r2\backend_typecheck_rerun2.summary.log"
"C:\Progra~1\nodejs\npm.cmd" run -w backend build > "artifacts\phase2k-validation-20260713-r2\backend_build_rerun2.out.log" 2> "artifacts\phase2k-validation-20260713-r2\backend_build_rerun2.err.log"
echo EXITCODE:%errorlevel%> "artifacts\phase2k-validation-20260713-r2\backend_build_rerun2.summary.log"
"C:\Progra~1\nodejs\npm.cmd" run -w frontend test > "artifacts\phase2k-validation-20260713-r2\frontend_test_rerun2.out.log" 2> "artifacts\phase2k-validation-20260713-r2\frontend_test_rerun2.err.log"
echo EXITCODE:%errorlevel%> "artifacts\phase2k-validation-20260713-r2\frontend_test_rerun2.summary.log"
endlocal
