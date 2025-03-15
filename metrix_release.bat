cd android
call gradlew assembleRelease

call adb install app/build/outputs/apk/release/app-release.apk

