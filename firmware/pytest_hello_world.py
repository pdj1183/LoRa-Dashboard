# pytest_sensor_log.py
import pytest
import serial
import time

@pytest.mark.esp32
def test_sensor_output(test_env, dut):
    """
    Check that sensor task logs simulated temperature.
    """
    dut.expect_exact("[sensor_task] Simulated temp: 28.0°C", timeout=10)

