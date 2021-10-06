#  Copyright 2019 École Polytechnique
#
#  Authorship
#    Luciano Di Palma <luciano.di-palma@polytechnique.edu>
#    Enhui Huang <enhui.huang@polytechnique.edu>
#    Le Ha Vy Nguyen <nguyenlehavy@gmail.com>
#    Laurent Cetinsoy <laurent.cetinsoy@gmail.com>
#
#  Disclaimer
#    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
#    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL
#    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
#    CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
#    IN THE SOFTWARE.

from setuptools import setup, find_packages

setup(
    name="aideme-web-api",
    version="0.0.1",
    packages=find_packages(),
    python_requires=">=3.6, <4",
    install_requires=[
        "Flask>=1.1.2",
        "flask-cors>=3.0.10",
        "pandas>=1.2.2",
        "dill>=0.3.3",
        "redis>=3.5.3",
    ],
    dependency_links=[
        "https://gitlab.inria.fr/ldipalma/aideme/-/archive/master/aideme-master.tar.gz"
    ],
    extras_require={
        "dev": ["black", "pylint"],
        "test": ["pytest>=6.2.2"],
    },
)
