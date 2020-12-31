using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodstarClocktica
{
    class BcLoadException : Exception
    {
        public BcLoadException(string message) : base(message) { }
    }
}
