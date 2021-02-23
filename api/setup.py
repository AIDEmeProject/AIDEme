from setuptools import setup, find_packages

setup(
    name="aideme-web-api",
    version="0.0.1",
    packages=find_packages(),
    python_requires=">=3.6, <4",
    install_requires=["Flask>=1.1.2", "flask-cors>=3.0.10", "pandas>=1.2.2"],
    dependency_links=[
        "https://gitlab.inria.fr/ldipalma/aideme/-/archive/master/aideme-master.tar.gz"
    ],
    extras_require={
        "dev": ["black", "pylint"],
        "test": ["pytest>=6.2.2"],
    },
)
