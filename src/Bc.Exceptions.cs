using System;

namespace BloodstarClocktica
{
    internal static partial class BC
    {
        internal class DataException : Exception
        {
            public DataException(string message) : base(message) { }
        }
        internal class LoadException : Exception
        {
            public LoadException(string message) : base(message) { }
        }
        internal class DuplicateIdException : Exception
        {
            public DuplicateIdException(string message) : base(message) { }
        }
    }
}
