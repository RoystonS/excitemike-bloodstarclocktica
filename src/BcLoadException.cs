using System;

namespace BloodstarClocktica
{
    class BcLoadException : Exception
    {
        public BcLoadException(string message) : base(message) { }
    }
}
