# The following lines of boilerplate have to be in your project's
# CMakeLists in this exact order for cmake to work correctly
cmake_minimum_required(VERSION 3.16)

include(${CMAKE_CURRENT_SOURCE_DIR}/include/secrets.cmake)

add_compile_definitions(
    WIFI_SSID=${WIFI_SSID}
    WIFI_PASSWORD=${WIFI_PASSWORD}
)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(lora firmware)


