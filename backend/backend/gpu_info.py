import platform
import subprocess
import json
import psutil


class GPUInfo:
    def __init__(self):
        self.vendor_map = {
            "10DE": "NVIDIA",
            "1002": "AMD",
            "8086": "Intel",
            "106B": "Apple",
        }

        self.codecs = {
            "NVIDIA": "h264_nvenc",
            "AMD": "h264_amf",
            "Intel": "h264_qsv",
            "Apple": "h264_videotoolbox",
            "Unknown": "libx264",
        }

        self.whisper_models = [
            (10000, "large"),
            (6000, "turbo"),
            (5000, "medium"),
            (2000, "small"),
            (1000, "base"),
            (0, "tiny"),
        ]

    def extract_ids(self, pnp_device_id):
        vendor_id, device_id = None, None
        if "VEN_" in pnp_device_id and "DEV_" in pnp_device_id:
            try:
                vendor_id = pnp_device_id.split("VEN_")[1].split("&")[0]
                device_id = pnp_device_id.split("DEV_")[1].split("&")[0]
            except IndexError:
                pass
        return vendor_id, device_id

    def get_vram_with_tool(self, vendor):
        """
        Sprawdza ilość VRAM za pomocą odpowiednich narzędzi na podstawie dostawcy GPU.
        """
        try:
            if vendor == "NVIDIA":
                return self._get_vram_nvidia()
            elif vendor == "AMD":
                return self._get_vram_amd()
            elif vendor == "Intel":
                return self._get_vram_intel()
            elif vendor == "Apple":
                return self._get_vram_apple()
            else:
                print(f"No VRAM detection tool available for vendor: {vendor}")
                return 0
        except Exception as e:
            print(f"Error fetching VRAM for vendor {vendor}: {e}")
            return 0

    def _get_vram_nvidia(self):
        """
        Używa nvidia-smi do sprawdzenia ilości VRAM dla kart NVIDIA.
        """
        try:
            vram_info = subprocess.check_output(
                [
                    "nvidia-smi",
                    "--query-gpu=memory.total",
                    "--format=csv,noheader,nounits",
                ],
                text=True,
            )
            return int(vram_info.strip().split("\n")[0])  # VRAM w MB
        except FileNotFoundError:
            print("nvidia-smi not found. Ensure NVIDIA drivers are installed.")
            return 0
        except Exception as e:
            print(f"Error using nvidia-smi: {e}")
            return 0

    def _get_vram_amd(self):
        """
        Używa rocm-smi do sprawdzenia ilości VRAM dla kart AMD.
        """
        try:
            vram_info = subprocess.check_output(
                ["rocm-smi", "--showmeminfo", "vram"], text=True
            )
            for line in vram_info.split("\n"):
                if "Total" in line:
                    return int(
                        line.split(":")[-1].strip().replace(" MiB", "")
                    )  # VRAM w MB
            return 0
        except FileNotFoundError:
            print("rocm-smi not found. Ensure AMD ROCm is installed.")
            return 0
        except Exception as e:
            print(f"Error using rocm-smi: {e}")
            return 0

    def _get_vram_intel(self):
        """
        Używa intel_gpu_top do sprawdzenia ilości VRAM dla kart Intel.
        """
        try:
            intel_info = subprocess.check_output(["intel_gpu_top", "-J"], text=True)
            import json

            intel_data = json.loads(intel_info)
            vram = intel_data.get("DRAM", {}).get("total", 0)  # Total VRAM in MB
            return int(vram)
        except FileNotFoundError:
            print("intel_gpu_top not found. Ensure intel-gpu-tools is installed.")
            return 0
        except Exception as e:
            print(f"Error using intel_gpu_top: {e}")
            return 0

    def _get_vram_apple(self):
        """
        Przypisuje połowę pamięci RAM dostępnej w laptopie.
        """
        try:
            # Pobierz całkowitą ilość RAM w bajtach
            total_ram_bytes = psutil.virtual_memory().total

            # Przelicz na megabajty i podziel na pół
            half_ram_mb = total_ram_bytes // (1024 * 1024 * 2)

            return half_ram_mb
        except Exception as e:
            print(f"Error retrieving system memory: {e}")
            return 0

    def get_gpu_info(self):
        system = platform.system()
        gpu_list = []

        if system == "Windows":
            gpu_list = self._get_windows_gpu_info()
        elif system == "Linux":
            gpu_list = self._get_linux_gpu_info()
        elif system == "Darwin":  # macOS
            gpu_list = self._get_mac_gpu_info()

        # Update vendor, codec, and Whisper model information
        for gpu in gpu_list:
            vendor = self.vendor_map.get(gpu.get("vendor_id", "").upper(), "Unknown")
            best_codec = self.codecs.get(vendor, "libx264")
            gpu["vendor"] = vendor
            gpu["codec"] = best_codec

            # Use tools to fetch VRAM if available
            if "vram" not in gpu or gpu["vram"] == 0:
                gpu["vram"] = self.get_vram_with_tool(vendor)

            if "vram" in gpu:
                gpu["whisper_model"] = self.get_best_whisper_model(gpu["vram"])

        # print(gpu_list)
        return gpu_list

    def _get_windows_gpu_info(self):
        try:
            import wmi

            gpu_list = []
            c = wmi.WMI()
            for gpu in c.Win32_VideoController():
                gpu_info = {
                    "name": gpu.Name,
                    "vendor_id": "Unknown",
                    "device_id": "Unknown",
                }
                vendor_id, device_id = self.extract_ids(gpu.PNPDeviceID)
                gpu_info["vendor_id"] = vendor_id
                gpu_info["device_id"] = device_id
                gpu_list.append(gpu_info)
            return gpu_list
        except ImportError:
            print("WMI library not found. Install it with `pip install wmi`.")
            return []

    def _get_linux_gpu_info(self):
        try:
            lspci_output = subprocess.check_output(["lspci", "-nn"], text=True)
            gpu_list = []
            for line in lspci_output.split("\n"):
                if "VGA" in line or "3D controller" in line:
                    gpu_info = {
                        "name": "Unknown",
                        "vendor_id": "Unknown",
                        "device_id": "Unknown",
                    }
                    parts = line.split()
                    gpu_info["name"] = " ".join(parts[2:-1])

                    if "[" in line and "]" in line:
                        bracket_content = line.split("[")[-1].split("]")[0]
                        if ":" in bracket_content:
                            vendor_device = bracket_content.split(":")
                            if len(vendor_device) == 2:
                                gpu_info["vendor_id"], gpu_info["device_id"] = (
                                    vendor_device
                                )

                    gpu_list.append(gpu_info)
            return gpu_list
        except FileNotFoundError:
            print("lspci not found. Ensure pciutils is installed.")
            return []
        except subprocess.CalledProcessError:
            print("Error: lspci failed. Ensure proper PCI access.")
            return []

    def _get_mac_gpu_info(self):
        try:
            sp_output = subprocess.check_output(
                ["system_profiler", "SPDisplaysDataType"], text=True
            )
            gpu_list = []
            lines = sp_output.split("\n")
            gpu_info = {}
            for line in lines:
                line = line.strip()
                if line.startswith("Chipset Model:"):
                    gpu_info["name"] = line.split(":")[-1].strip()
                elif line.startswith("Vendor:"):
                    vendor_info = line.split(":")[-1].strip()
                    gpu_info["vendor"] = vendor_info.split(" (")[0]
                    if "(" in vendor_info:
                        vendor_id = vendor_info.split("(")[1].strip(")").upper()
                        gpu_info["vendor_id"] = (
                            vendor_id[2:] if vendor_id.startswith("0X") else vendor_id
                        )
                elif line.startswith("Total Number of Cores:"):
                    gpu_info["cores"] = line.split(":")[-1].strip()

                elif line.startswith("VRAM (Total):"):
                    gpu_info["vram"] = int(
                        line.split(":")[-1].strip().replace(" MB", "")
                    )

                if "name" in gpu_info and "vendor" in gpu_info:
                    gpu_list.append(
                        {
                            "name": gpu_info.get("name", "Unknown"),
                            "vendor_id": gpu_info.get("vendor_id", "Unknown"),
                            "device_id": "Unknown",
                            "vendor": gpu_info.get("vendor", "Unknown"),
                            "codec": "h264_videotoolbox",
                            "cores": gpu_info.get("cores", "Unknown"),
                        }
                    )
                    gpu_info = {}
            return gpu_list
        except FileNotFoundError:
            print("system_profiler not found or not supported.")
            return []
        except subprocess.SubprocessError as e:
            print(f"Error while running system_profiler: {e}")
            return []

    def get_best_whisper_model(self, vram):
        """Returns the best Whisper model based on available VRAM."""
        for min_vram, model in self.whisper_models:
            if vram >= min_vram:
                return model
        return "tiny"

    def save_to_json(self, gpu_list, file_path="gpu_info.json"):
        with open(file_path, "w") as f:
            json.dump(gpu_list, f, indent=4)
        print(f"GPU information saved to {file_path}")
