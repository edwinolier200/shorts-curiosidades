# Minimal stand-in for the removed setuptools pkg_resources (only what perth uses).
import importlib.util, os
def resource_filename(package, resource):
    spec = importlib.util.find_spec(package)
    return os.path.join(os.path.dirname(spec.origin), resource)
