using System;

namespace BloodstarClocktica
{
    class BcDataException : Exception
    {
        public BcDataException(string message) : base(message) { }
    }
}
